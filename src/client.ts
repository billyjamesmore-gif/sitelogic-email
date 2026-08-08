import { render } from "@react-email/components";
import { Resend } from "resend";
import * as React from "react";
import type {
  AlertProps,
  BrandConfig,
  DryRunInfo,
  EmailClientConfig,
  ReceiptProps,
  ReportProps,
  SendResult,
  WelcomeProps,
} from "./types";
import { WelcomeEmail } from "./templates/WelcomeEmail";
import { ReportEmail } from "./templates/ReportEmail";
import { ReceiptEmail } from "./templates/ReceiptEmail";
import { AlertEmail } from "./templates/AlertEmail";

function requireBrand(brand: BrandConfig): void {
  const missing = (["productName", "fromAddress", "supportEmail", "primaryColor", "baseUrl"] as const).filter(
    (k) => !brand[k]
  );
  if (missing.length) {
    throw new Error(
      `@sitelogic-ai/email: BrandConfig is missing required fields: ${missing.join(", ")}`
    );
  }
}

function fromWithName(brand: BrandConfig): string {
  // "Weather-Logix <weatherlogix@send.sitelogic-ai.com>"
  return `${brand.productName} <${brand.fromAddress}>`;
}

// The client returned by createEmailClient. One instance per product.
export interface EmailClient {
  sendWelcome(props: WelcomeProps): Promise<SendResult>;
  sendReport(props: ReportProps): Promise<SendResult>;
  sendReceipt(props: ReceiptProps): Promise<SendResult>;
  sendAlert(props: AlertProps): Promise<SendResult>;
  /** Render a template to HTML without sending (used by preview/tests). */
  render(kind: EmailKind, props: AnyProps): Promise<string>;
}

type EmailKind = "welcome" | "report" | "receipt" | "alert";
type AnyProps = WelcomeProps | ReportProps | ReceiptProps | AlertProps;

export function createEmailClient(config: EmailClientConfig): EmailClient {
  requireBrand(config.brand);

  const apiKey = config.apiKey ?? process.env.RESEND_API_KEY;
  // Dry-run when explicitly requested OR when no key is configured, so local
  // dev / CI never accidentally require a live key.
  const dryRun = config.dryRun ?? !apiKey;
  const resend = apiKey ? new Resend(apiKey) : null;
  const from = fromWithName(config.brand);

  const emitDryRun =
    config.onDryRun ??
    ((info: DryRunInfo) => {
      // Never logs the API key — only rendered content + envelope.
      console.info(
        `[@sitelogic-ai/email] DRY RUN → ${Array.isArray(info.to) ? info.to.join(", ") : info.to}\n  from: ${info.from}\n  subject: ${info.subject}\n  (html ${info.html.length} chars, not sent)`
      );
    });

  function elementFor(kind: EmailKind, props: AnyProps): React.ReactElement {
    const brand = config.brand;
    switch (kind) {
      case "welcome":
        return React.createElement(WelcomeEmail, { brand, props: props as WelcomeProps });
      case "report":
        return React.createElement(ReportEmail, { brand, props: props as ReportProps });
      case "receipt":
        return React.createElement(ReceiptEmail, { brand, props: props as ReceiptProps });
      case "alert":
        return React.createElement(AlertEmail, { brand, props: props as AlertProps });
    }
  }

  // Render HTML (kept for the public render() API + previews).
  async function renderKind(kind: EmailKind, props: AnyProps): Promise<string> {
    return render(elementFor(kind, props));
  }

  // Render both HTML and a plain-text alternative. Multipart emails (html +
  // text) score materially better with spam filters than HTML-only.
  async function renderBoth(
    kind: EmailKind,
    props: AnyProps
  ): Promise<{ html: string; text: string }> {
    const element = elementFor(kind, props);
    const [html, text] = await Promise.all([
      render(element),
      render(element, { plainText: true }),
    ]);
    return { html, text };
  }

  async function dispatch(
    kind: EmailKind,
    props: AnyProps,
    subject: string
  ): Promise<SendResult> {
    const finalSubject = props.subject ?? subject;
    let html: string;
    let text: string;
    try {
      ({ html, text } = await renderBoth(kind, props));
    } catch (e) {
      return {
        outcome: "failed",
        error: `render failed: ${e instanceof Error ? e.message : "unknown"}`,
      };
    }

    if (dryRun || !resend) {
      emitDryRun({ to: props.to, from, subject: finalSubject, html });
      return { outcome: "dry_run" };
    }

    try {
      const { data, error } = await resend.emails.send({
        from,
        to: props.to,
        subject: finalSubject,
        html,
        text,
        replyTo: config.brand.supportEmail,
      });
      if (error) {
        // Resend's error message never contains the API key.
        return { outcome: "failed", error: error.message };
      }
      return { outcome: "sent", id: data?.id };
    } catch (e) {
      return {
        outcome: "failed",
        error: e instanceof Error ? e.message : "unknown send error",
      };
    }
  }

  return {
    sendWelcome: (p) =>
      dispatch("welcome", p, `Welcome to ${config.brand.productName}`),
    sendReport: (p) =>
      dispatch(
        "report",
        p,
        `${(p as ReportProps).periodLabel} summary — ${config.brand.productName}`
      ),
    sendReceipt: (p) =>
      dispatch("receipt", p, `Your ${config.brand.productName} receipt`),
    sendAlert: (p) => dispatch("alert", p, (p as AlertProps).title),
    render: renderKind,
  };
}
