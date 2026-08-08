// Phase 1 finish-line test. Fires one real email through Resend to confirm the
// verified domain + API key + a template all work end to end.
//
// Usage (from the package folder, after `npm run build`):
//   RESEND_API_KEY=re_xxx node scripts/test-send.mjs you@example.com
//
// Without RESEND_API_KEY it runs in dry-run mode (renders, does not send).

import { createEmailClient } from "../dist/index.js";

const to = process.argv[2];
if (!to) {
  console.error("Usage: node scripts/test-send.mjs <recipient-email>");
  process.exit(1);
}

const email = createEmailClient({
  brand: {
    productName: "Weather-Logix",
    fromAddress: "weatherlogix@send.sitelogic-ai.com",
    supportEmail: "support@sitelogic-ai.com",
    primaryColor: "#f97316",
    baseUrl: "https://weather-logix.vercel.app",
  },
  // apiKey falls back to process.env.RESEND_API_KEY
});

const result = await email.sendWelcome({
  to,
  name: "Billy",
  subject: "Test send from @sitelogic-ai/email ✅",
});

console.log("Result:", result);
if (result.outcome === "failed") process.exit(1);
