import { Column, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import type { BrandConfig, ReportProps } from "../types";
import { Button, Heading, Layout, Paragraph, palette } from "./Layout";

export function ReportEmail({
  brand,
  props,
}: {
  brand: BrandConfig;
  props: ReportProps;
}) {
  const ctaLabel = props.ctaLabel ?? "View full report";
  return (
    <Layout
      brand={brand}
      preview={`${props.periodLabel} report from ${brand.productName}`}
    >
      <Heading>
        {props.periodLabel} summary{props.name ? ` for ${props.name}` : ""}
      </Heading>

      <Section style={{ padding: "6px 0 4px" }}>
        <Row>
          {props.stats.slice(0, 4).map((s) => (
            <Column
              key={s.label}
              style={{ padding: "0 6px 12px", verticalAlign: "top" }}
            >
              <table
                cellPadding={0}
                cellSpacing={0}
                style={{ width: "100%" }}
              >
                <tr>
                  <td
                    style={{
                      border: `1px solid ${palette.rule}`,
                      borderRadius: 10,
                      padding: "14px 14px",
                      backgroundColor: "#f8fafc",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 22,
                        fontWeight: 600,
                        color: brand.primaryColor,
                        margin: 0,
                        lineHeight: 1,
                      }}
                    >
                      {s.value}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: palette.inkFaint,
                        margin: "6px 0 0",
                      }}
                    >
                      {s.label}
                    </Text>
                  </td>
                </tr>
              </table>
            </Column>
          ))}
        </Row>
      </Section>

      <Paragraph>{props.summary}</Paragraph>

      <Section style={{ padding: "2px 0 18px" }}>
        <Button href={props.ctaUrl} color={brand.primaryColor}>
          {ctaLabel} →
        </Button>
      </Section>
    </Layout>
  );
}

ReportEmail.PreviewProps = {
  brand: {
    productName: "Weather-Logix",
    fromAddress: "weatherlogix@send.sitelogic-ai.com",
    supportEmail: "support@sitelogic-ai.com",
    primaryColor: "#f97316",
    baseUrl: "https://weather-logix.vercel.app",
  },
  props: {
    to: "test@example.com",
    name: "Billy",
    periodLabel: "June 2026",
    stats: [
      { label: "Inclement days", value: "10" },
      { label: "Adverse days", value: "6" },
      { label: "Total rainfall", value: "113.8mm" },
      { label: "Max gust", value: "38.7mph" },
    ],
    summary:
      "Across 30 days in June 2026, 10 qualified as inclement (EOT-qualifying under JCT Clause 2.29.9). You may have grounds for an Extension of Time claim.",
    ctaUrl: "https://weather-logix.vercel.app/new",
  },
};

export default ReportEmail;
