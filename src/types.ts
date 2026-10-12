// Public types for @sitelogic-ai/email.
//
// One package, three products. Each product initialises the client once with
// its own BrandConfig (name, colour, logo, from-address, support email) while
// the Resend API key is shared across the umbrella account and read from env.

export interface BrandConfig {
  /** Product name shown in email chrome, e.g. "Weather-Logix". */
  productName: string;
  /** Optional suffix shown after the name in the primary colour, e.g. " AI"
   *  for the SiteLogic AI wordmark (productName "SiteLogic"). */
  nameAccent?: string;
  /** From address for this product, e.g. "weatherlogix@send.sitelogic-ai.com".
   *  A display name is added automatically ("Weather-Logix <...>"). */
  fromAddress: string;
  /** Support / reply-to address shown in the footer, e.g. "support@sitelogic-ai.com". */
  supportEmail: string;
  /** Primary brand colour (hex) used for buttons and accents. */
  primaryColor: string;
  /** Absolute URL to the product logo (optional — falls back to a text mark). */
  logoUrl?: string;
  /** Product base URL, used for footer link + default CTA targets. */
  baseUrl: string;
}

export interface EmailClientConfig {
  brand: BrandConfig;
  /** Shared Resend API key. Defaults to process.env.RESEND_API_KEY. */
  apiKey?: string;
  /** When true, render templates but do NOT call Resend. Auto-on when the API
   *  key is missing. Great for local dev / CI. */
  dryRun?: boolean;
  /** Optional sink for dry-run output (defaults to console.info). */
  onDryRun?: (info: DryRunInfo) => void;
}

export interface DryRunInfo {
  to: string | string[];
  from: string;
  subject: string;
  /** Rendered HTML of the email. */
  html: string;
}

// ── Send result ─────────────────────────────────────────────────────────────
export type SendOutcome = "sent" | "dry_run" | "failed";

export interface SendResult {
  outcome: SendOutcome;
  /** Resend message id when outcome === "sent". */
  id?: string;
  /** Human-readable error when outcome === "failed" (never contains the key). */
  error?: string;
}

// ── Shared recipient shape ──────────────────────────────────────────────────
interface BaseSend {
  to: string | string[];
  /** Optional per-send subject override. */
  subject?: string;
}

// ── Per-email props ─────────────────────────────────────────────────────────
export interface WelcomeProps extends BaseSend {
  name?: string;
  /** Optional CTA button URL (defaults to brand.baseUrl). */
  ctaUrl?: string;
  ctaLabel?: string;
}

export interface ReportProps extends BaseSend {
  name?: string;
  /** Report period label, e.g. "June 2026". */
  periodLabel: string;
  /** Headline stats rendered as a grid. */
  stats: { label: string; value: string }[];
  /** Short narrative paragraph. */
  summary: string;
  ctaUrl: string;
  ctaLabel?: string;
}

export interface ReceiptProps extends BaseSend {
  name?: string;
  /** e.g. "Pro — Monthly". */
  planName: string;
  /** Formatted amount incl. currency, e.g. "£34.99". */
  amount: string;
  /** ISO date or display date of the charge. */
  date: string;
  /** Optional invoice/receipt number. */
  invoiceNumber?: string;
  /** Link to the hosted invoice / billing portal. */
  manageUrl?: string;
}

/** A general message (EM-03): invitations, account and billing emails, formal notices. */
export interface MessageProps extends BaseSend {
  /** Heading. */
  title: string;
  /** Body text: a blank line starts a new paragraph, a line break is kept. */
  body: string;
  /** Inbox preview text (defaults to the title). */
  preview?: string;
  /** A coloured line above the heading, e.g. "This is a reminder." */
  notice?: { text: string; tone?: "info" | "warning" | "danger" };
  /** A highlighted label + value, e.g. Deadline. */
  highlight?: { label: string; value: string };
  /** A quoted personal message. */
  quote?: { text: string; by?: string };
  /** The main button, with an optional note under it. */
  cta?: { label: string; url: string; note?: string };
  /** A quieter second button, with an optional note under it. */
  secondary?: { label: string; url: string; note?: string };
  /** Closing lines, e.g. "Thanks,\nThe SiteLogic team". */
  signoff?: string;
  /** An extra footer line: why they're getting this email. */
  footerNote?: string;
  /** Reply-to (defaults to the brand's support address). */
  replyTo?: string;
  /** Full From header, overriding the brand's ("Name <address>"). */
  from?: string;
  /** Attachments, content base64-encoded. */
  attachments?: { filename: string; content: string }[];
}

export interface AlertProps extends BaseSend {
  /** Heading of the alert. */
  title: string;
  /** Body text (plain string; rendered as a paragraph). */
  body: string;
  /** Optional CTA. */
  ctaUrl?: string;
  ctaLabel?: string;
  /** Visual tone of the alert. */
  tone?: "info" | "success" | "warning" | "danger";
}
