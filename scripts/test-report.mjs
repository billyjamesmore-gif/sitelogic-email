// Real weather-report test send. Geocodes a UK postcode, fetches verified
// Open-Meteo data for last calendar month, classifies days (JCT 2.29.9), and
// emails the branded report via @sitelogic-ai/email.
//
// Usage: RESEND_API_KEY=re_xxx node scripts/test-report.mjs <postcode> <to-email>

import { createEmailClient } from "../dist/index.js";

const postcodeArg = process.argv[2];
const to = process.argv[3];
if (!postcodeArg || !to) {
  console.error("Usage: node scripts/test-report.mjs <postcode> <to-email>");
  process.exit(1);
}

// ── last calendar month ──
function lastCalendarMonth(ref = new Date()) {
  const y = ref.getUTCFullYear();
  const m = ref.getUTCMonth();
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 0));
  const iso = (d) => d.toISOString().split("T")[0];
  const label = start.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return { label, startDate: iso(start), endDate: iso(end) };
}

// ── classify (wind relevant = true for the summary view) ──
function classify(d) {
  const ir = d.precip > 5,
    iw = d.windMax >= 50,
    iff = d.tempMax < 2,
    ih = d.tempMax > 30,
    is = d.snow > 0;
  const ar = d.precip >= 3 && d.precip <= 5,
    aw = d.windMax >= 35 && d.windMax < 50,
    ac = d.tempMax >= 2 && d.tempMax < 5,
    ah = d.tempMax >= 28 && d.tempMax <= 30;
  if (ir || iw || iff || ih || is) return "Inclement";
  if (ar || aw || ac || ah) return "Adverse";
  return "Normal";
}

const lm = lastCalendarMonth();
const pc = postcodeArg.replace(/\s/g, "").toUpperCase();

const geo = await (
  await fetch(`https://api.postcodes.io/postcodes/${pc}`)
).json();
if (geo.status !== 200) {
  console.error("Postcode not found:", postcodeArg);
  process.exit(1);
}
const { latitude, longitude, admin_district } = geo.result;

const params = new URLSearchParams({
  latitude,
  longitude,
  start_date: lm.startDate,
  end_date: lm.endDate,
  daily:
    "precipitation_sum,snowfall_sum,windspeed_10m_max,windgusts_10m_max,temperature_2m_max,temperature_2m_min",
  timezone: "Europe/London",
  wind_speed_unit: "mph",
});
const wx = await (
  await fetch(`https://archive-api.open-meteo.com/v1/archive?${params}`)
).json();
if (wx.error) {
  console.error("Weather error:", wx.reason);
  process.exit(1);
}

const days = wx.daily.time.map((date, i) => ({
  precip: wx.daily.precipitation_sum[i] ?? 0,
  snow: wx.daily.snowfall_sum[i] ?? 0,
  windMax: wx.daily.windspeed_10m_max[i] ?? 0,
  gustMax: wx.daily.windgusts_10m_max[i] ?? 0,
  tempMax: wx.daily.temperature_2m_max[i] ?? 999,
  tempMin: wx.daily.temperature_2m_min[i] ?? 999,
}));
const incl = days.filter((d) => classify(d) === "Inclement").length;
const adv = days.filter((d) => classify(d) === "Adverse").length;
const totalRain = days.reduce((s, d) => s + d.precip, 0);
const maxGust = days.length ? Math.max(...days.map((d) => d.gustMax)) : 0;

console.log(
  `${admin_district} · ${lm.label} · ${days.length} days · ${incl} inclement · ${adv} adverse · ${totalRain.toFixed(1)}mm rain · ${maxGust.toFixed(1)}mph gust`
);

const email = createEmailClient({
  brand: {
    productName: "Weather-Logix",
    fromAddress: "weatherlogix@send.sitelogic-ai.com", // verified domain
    supportEmail: "support@sitelogic-ai.com",
    primaryColor: "#f97316",
    baseUrl: "https://weather-logix.vercel.app",
  },
});

const reportLink = `https://weather-logix.vercel.app/new?postcode=${encodeURIComponent(pc)}&start=${lm.startDate}&end=${lm.endDate}`;

const result = await email.sendReport({
  to,
  name: "Billy",
  periodLabel: `${lm.label} — ${pc} (${admin_district})`,
  stats: [
    { label: "Inclement days", value: String(incl) },
    { label: "Adverse days", value: String(adv) },
    { label: "Total rainfall", value: `${totalRain.toFixed(1)}mm` },
    { label: "Max gust", value: `${maxGust.toFixed(1)}mph` },
  ],
  summary: `Across ${days.length} days in ${lm.label} at ${pc} (${admin_district}), ${incl} qualified as inclement (EOT-qualifying under JCT Clause 2.29.9) and ${adv} were borderline adverse. ${incl > 0 ? "You may have grounds for an Extension of Time claim for the inclement period." : "No inclement weather days were recorded this period."}`,
  ctaUrl: reportLink,
  ctaLabel: "Generate full EOT report",
});

console.log("Result:", result);
if (result.outcome === "failed") process.exit(1);
