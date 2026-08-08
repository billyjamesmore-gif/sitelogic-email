// @sitelogic-ai/email — public API.

export { createEmailClient } from "./client";
export type { EmailClient } from "./client";

export type {
  BrandConfig,
  EmailClientConfig,
  DryRunInfo,
  SendOutcome,
  SendResult,
  WelcomeProps,
  ReportProps,
  ReceiptProps,
  AlertProps,
} from "./types";

// Templates are exported too, so consumers (or the react-email preview server)
// can render them directly if needed.
export { WelcomeEmail } from "./templates/WelcomeEmail";
export { ReportEmail } from "./templates/ReportEmail";
export { ReceiptEmail } from "./templates/ReceiptEmail";
export { AlertEmail } from "./templates/AlertEmail";
