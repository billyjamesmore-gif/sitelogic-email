// Public types for @sitelogic-ai/email.
//
// One package, three products. Each product initialises the client once with
// its own BrandConfig (name, colour, logo, from-address, support email) while
// the Resend API key is shared across the umbrella account and read from env.

export interface BrandConfig {
  /** Product name shown in email chrome, e.g. "Weather-Logix". */
  productName: string;
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
