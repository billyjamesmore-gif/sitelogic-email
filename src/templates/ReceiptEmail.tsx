import { Hr, Section, Text } from "@react-email/components";
import * as React from "react";
import type { BrandConfig, ReceiptProps } from "../types";
import { Button, Heading, Layout, Paragraph, palette } from "./Layout";

function Line({ label, value }: { label: string; value: string }) {
  return (
    <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
      <tr>
        <td style={{ padding: "6px 0", fontSize: 13, color: palette.inkFaint }}>
          {label}
        </td>
        <td
          style={{
            padding: "6px 0",
            fontSize: 13,
            color: palette.ink,
            textAlign: "right" as const,
            fontWeight: 600,
          }}
        >
          {value}
        </td>
      </tr>
    </table>
  );
}

export function ReceiptEmail({
  brand,
  props,
}: {
  brand: BrandConfig;
  props: ReceiptProps;
}) {
  return (
    <Layout brand={brand} preview={`Your ${brand.productName} receipt`}>
      <Heading>Payment received</Heading>
      <Paragraph>
        Thanks{props.name ? `, ${props.name}` : ""} — your {brand.productName}{" "}
        subscription payment was successful. Here are the details.
      </Paragraph>

      <Section
        style={{
          border: `1px solid ${palette.rule}`,
          borderRadius: 10,
          padding: "10px 16px",
          margin: "4px 0 16px",
        }}
      >
        <Line label="Plan" value={props.planName} />
        <Line label="Amount" value={props.amount} />
        <Line label="Date" value={props.date} />
        {props.invoiceNumber ? (
          <Line label="Invoice" value={props.invoiceNumber} />
        ) : null}
        <Hr style={{ borderColor: palette.rule, margin: "8px 0" }} />
        <Line label="Total charged" value={props.amount} />
      </Section>

      {props.manageUrl ? (
        <Section style={{ padding: "2px 0 18px" }}>
          <Button href={props.manageUrl} color={brand.primaryColor}>
            Manage subscription
          </Button>
        </Section>
      ) : null}
    </Layout>
  );
}

ReceiptEmail.PreviewProps = {
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
    planName: "Pro — Monthly",
    amount: "£34.99",
    date: "5 August 2026",
    invoiceNumber: "WL-000123",
    manageUrl: "https://weather-logix.vercel.app/settings",
  },
};

export default ReceiptEmail;
