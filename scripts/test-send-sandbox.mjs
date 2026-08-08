// Sandbox test send — works BEFORE the custom domain is verified.
// From must be onboarding@resend.dev and To must be your Resend account email.
//
// Usage: RESEND_API_KEY=re_xxx node scripts/test-send-sandbox.mjs you@example.com

import { createEmailClient } from "../dist/index.js";

const to = process.argv[2];
if (!to) {
  console.error("Usage: node scripts/test-send-sandbox.mjs <your-resend-account-email>");
  process.exit(1);
}

const email = createEmailClient({
  brand: {
    productName: "Weather-Logix",
    // Sandbox sender until send.sitelogic-ai.com is verified:
    fromAddress: "onboarding@resend.dev",
    supportEmail: "support@sitelogic-ai.com",
    primaryColor: "#f97316",
    baseUrl: "https://weather-logix.vercel.app",
  },
});

const result = await email.sendWelcome({
  to,
  name: "Billy",
  subject: "✅ Test from @sitelogic-ai/email (sandbox)",
});

console.log("Result:", result);
if (result.outcome === "failed") process.exit(1);
