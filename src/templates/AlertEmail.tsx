import { Section } from "@react-email/components";
import * as React from "react";
import type { AlertProps, BrandConfig } from "../types";
import { Button, Heading, Layout, Paragraph } from "./Layout";

const TONE: Record<
  NonNullable<AlertProps["tone"]>,
  { bg: string; fg: string; label: string }
> = {
  info: { bg: "rgba(37,99,235,0.10)", fg: "#1d4ed8", label: "Info" },
  success: { bg: "rgba(22,163,74,0.12)", fg: "#15803d", label: "Success" },
  warning: { bg: "rgba(245,158,11,0.16)", fg: "#b45309", label: "Warning" },
  danger: { bg: "rgba(220,38,38,0.12)", fg: "#b91c1c", label: "Alert" },
};

/**
 * The body keeps its line breaks: a blank line starts a new paragraph and a
 * single line break becomes a <br />. A body without line breaks renders
 * exactly as before (one paragraph).
 */
export function bodyParagraphs(body: string): string[][] {
  return body
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .map((p) => p.split("\n").map((l) => l.trimEnd()))
    .filter((lines) => lines.some((l) => l.trim()));
}

export function AlertEmail({
  brand,
  props,
}: {
  brand: BrandConfig;
  props: AlertProps;
}) {
  const tone = TONE[props.tone ?? "info"];
  return (
    <Layout brand={brand} preview={props.title}>
      <Section style={{ paddingBottom: 12 }}>
        <span
          style={{
            display: "inline-block",
            backgroundColor: tone.bg,
            color: tone.fg,
            fontSize: 11,
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: 999,
            textTransform: "uppercase" as const,
            letterSpacing: "0.04em",
          }}
        >
          {tone.label}
        </span>
      </Section>
      <Heading>{props.title}</Heading>
      {bodyParagraphs(props.body).map((lines, i) => (
        <Paragraph key={i}>
          {lines.map((line, j) => (
            <React.Fragment key={j}>
              {j ? <br /> : null}
              {line}
            </React.Fragment>
          ))}
        </Paragraph>
      ))}
      {props.ctaUrl ? (
        <Section style={{ padding: "2px 0 18px" }}>
          <Button href={props.ctaUrl} color={brand.primaryColor}>
            {props.ctaLabel ?? "View details"}
          </Button>
        </Section>
      ) : null}
    </Layout>
  );
}

AlertEmail.PreviewProps = {
  brand: {
    productName: "TidySite",
    fromAddress: "tidysite@send.sitelogic-ai.com",
    supportEmail: "support@sitelogic-ai.com",
    primaryColor: "#f97316",
    baseUrl: "https://tidysite.vercel.app",
  },
  props: {
    to: "test@example.com",
    title: "Clean-up notice not acknowledged",
    body: "The clean-up notice issued to Smith Groundworks 24 hours ago has not been acknowledged. A final notice has now been sent and the works may be back-charged.",
    tone: "warning" as const,
    ctaUrl: "https://tidysite.vercel.app/history",
    ctaLabel: "View notice",
  },
};

export default AlertEmail;
