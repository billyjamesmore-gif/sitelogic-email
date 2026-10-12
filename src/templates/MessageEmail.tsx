import { Section, Text } from "@react-email/components";
import * as React from "react";
import type { BrandConfig, MessageProps } from "../types";
import { bodyParagraphs } from "./AlertEmail";
import { Button, Heading, Layout, Paragraph, palette } from "./Layout";

// A general message in the shared chrome (EM-03): invitations, account and
// billing emails, formal notices. Everything but the title and body is
// optional, so each product says exactly what it said before, in one layout.

const NOTICE_TONE = {
  info: "#1d4ed8",
  warning: "#b45309",
  danger: "#b91c1c",
} as const;

function Lines({ text }: { text: string }) {
  return (
    <>
      {bodyParagraphs(text).map((lines, i) => (
        <Paragraph key={i}>
          {lines.map((line, j) => (
            <React.Fragment key={j}>
              {j ? <br /> : null}
              {line}
            </React.Fragment>
          ))}
        </Paragraph>
      ))}
    </>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ fontSize: 12, lineHeight: "1.5", color: palette.inkFaint, margin: "8px 0 0" }}>{children}</Text>
  );
}

export function MessageEmail({ brand, props }: { brand: BrandConfig; props: MessageProps }) {
  return (
    <Layout brand={brand} preview={props.preview ?? props.title} note={props.footerNote}>
      {props.notice ? (
        <Text style={{ fontSize: 14, fontWeight: 600, color: NOTICE_TONE[props.notice.tone ?? "warning"], margin: "0 0 12px" }}>
          {props.notice.text}
        </Text>
      ) : null}
      <Heading>{props.title}</Heading>
      <Lines text={props.body} />
      {props.quote ? (
        <Section
          style={{
            borderLeft: `3px solid ${brand.primaryColor}`,
            backgroundColor: "#f8fafc",
            padding: "8px 14px",
            margin: "4px 0 16px",
          }}
        >
          <Text style={{ fontSize: 14, lineHeight: "1.6", color: "#374151", margin: 0 }}>{props.quote.text}</Text>
          {props.quote.by ? (
            <Text style={{ fontSize: 12, color: palette.inkFaint, margin: "4px 0 0" }}>— {props.quote.by}</Text>
          ) : null}
        </Section>
      ) : null}
      {props.highlight ? (
        <Section style={{ backgroundColor: palette.bg, borderRadius: 8, padding: "10px 12px", margin: "2px 0 16px" }}>
          <Text style={{ fontSize: 13, color: palette.ink, margin: 0 }}>
            <strong>{props.highlight.label}:</strong> {props.highlight.value}
          </Text>
        </Section>
      ) : null}
      {props.cta ? (
        <Section style={{ padding: "2px 0 14px" }}>
          <Button href={props.cta.url} color={brand.primaryColor}>
            {props.cta.label}
          </Button>
          {props.cta.note ? <Note>{props.cta.note}</Note> : null}
        </Section>
      ) : null}
      {props.secondary ? (
        <Section style={{ borderTop: `1px solid ${palette.rule}`, padding: "14px 0 14px" }}>
          <a
            href={props.secondary.url}
            style={{
              display: "inline-block",
              color: "#374151",
              textDecoration: "none",
              border: `1px solid ${palette.rule}`,
              padding: "8px 14px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {props.secondary.label}
          </a>
          {props.secondary.note ? <Note>{props.secondary.note}</Note> : null}
        </Section>
      ) : null}
      {props.signoff ? <Lines text={props.signoff} /> : null}
    </Layout>
  );
}

MessageEmail.PreviewProps = {
  brand: {
    productName: "TidySite",
    fromAddress: "tidysite@send.sitelogic-ai.com",
    supportEmail: "support@sitelogic-ai.com",
    primaryColor: "#f97316",
    baseUrl: "https://tidysite.sitelogic-ai.com",
  },
  props: {
    to: "site@example.com",
    title: "Demo Construction Ltd",
    body: "SITE CLEAN-UP NOTICE\n\nArea: Block A, level 2 corridor\n\nPlasterboard offcuts have been left across the corridor. Please clear them by the deadline below.",
    notice: { text: "This is a reminder. The deadline below still stands.", tone: "warning" as const },
    highlight: { label: "Deadline", value: "Thursday 15 October, 17:00" },
    cta: { label: "✓ Mark as cleared & upload photos", url: "https://example.com/clear", note: "Once you have cleared the area, upload photos as proof." },
    secondary: { label: "Acknowledge receipt", url: "https://example.com/ack", note: "Acknowledging confirms you received this notice." },
    footerNote: "Sent via TidySite on behalf of Demo Construction Ltd.",
  },
} satisfies { brand: BrandConfig; props: MessageProps };

export default MessageEmail;
