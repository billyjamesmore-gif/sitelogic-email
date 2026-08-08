import { Section } from "@react-email/components";
import * as React from "react";
import type { BrandConfig, WelcomeProps } from "../types";
import { Button, Heading, Layout, Paragraph } from "./Layout";

export function WelcomeEmail({
  brand,
  props,
}: {
  brand: BrandConfig;
  props: WelcomeProps;
}) {
  const ctaUrl = props.ctaUrl ?? brand.baseUrl;
  const ctaLabel = props.ctaLabel ?? `Open ${brand.productName}`;
  return (
    <Layout brand={brand} preview={`Welcome to ${brand.productName}`}>
      <Heading>Welcome to {brand.productName}{props.name ? `, ${props.name}` : ""} 👋</Heading>
      <Paragraph>
        Thanks for signing up. {brand.productName} is ready to go — click below
        to get started.
      </Paragraph>
      <Section style={{ padding: "6px 0 18px" }}>
        <Button href={ctaUrl} color={brand.primaryColor}>
          {ctaLabel}
        </Button>
      </Section>
      <Paragraph>
        If you have any questions, just reply to this email — we read every one.
      </Paragraph>
    </Layout>
  );
}

// Preview export for `react-email` dev server.
WelcomeEmail.PreviewProps = {
  brand: {
    productName: "Weather-Logix",
    fromAddress: "weatherlogix@send.sitelogic-ai.com",
    supportEmail: "support@sitelogic-ai.com",
    primaryColor: "#f97316",
    baseUrl: "https://weather-logix.vercel.app",
  },
  props: { to: "test@example.com", name: "Billy" },
};

export default WelcomeEmail;
