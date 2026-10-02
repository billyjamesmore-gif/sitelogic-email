import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import type { BrandConfig } from "../types";

// Shared email chrome. Every template wraps its content in this so all four
// emails share one branded header/footer, themed by the product's BrandConfig.

const ink = "#111827";
const inkFaint = "#6b7280";
const inkMute = "#9ca3af";
const rule = "#e5e7eb";
const bg = "#f1f5f9";
const surface = "#ffffff";

export function Layout({
  brand,
  preview,
  children,
}: {
  brand: BrandConfig;
  preview: string;
  children: React.ReactNode;
}) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: bg,
          margin: 0,
          padding: "24px 0",
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
          color: ink,
        }}
      >
        <Container
          style={{
            maxWidth: 600,
            width: "100%",
            backgroundColor: surface,
            border: `1px solid ${rule}`,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          {/* Brand deep navy (brand/BRAND.md, D-16a). */}
          <Section style={{ backgroundColor: "#17222F", padding: "22px 28px" }}>
            {brand.logoUrl ? (
              <Img
                src={brand.logoUrl}
                alt={brand.productName}
                height={26}
                style={{ display: "block" }}
              />
            ) : (
              <table cellPadding={0} cellSpacing={0}>
                <tr>
                  <td
                    style={{
                      backgroundColor: brand.primaryColor,
                      width: 30,
                      height: 30,
                      borderRadius: 7,
                      textAlign: "center" as const,
                      color: "#17222F",
                      fontWeight: 700,
                      fontSize: 15,
                    }}
                  >
                    {brand.productName.charAt(0)}
                  </td>
                  <td style={{ paddingLeft: 10 }}>
                    <span
                      style={{ color: "#fff", fontWeight: 600, fontSize: 16 }}
                    >
                      {brand.productName}
                    </span>
                  </td>
                </tr>
              </table>
            )}
          </Section>

          {/* Body content */}
          <Section style={{ padding: "26px 28px 8px" }}>{children}</Section>

          {/* Footer */}
          <Hr style={{ borderColor: rule, margin: "20px 0 0" }} />
          <Section
            style={{
              backgroundColor: "#f8fafc",
              padding: "16px 28px",
            }}
          >
            <Text
              style={{
                fontSize: 11,
                lineHeight: "1.6",
                color: inkMute,
                margin: 0,
              }}
            >
              {brand.productName} ·{" "}
              <Link
                href={brand.baseUrl}
                style={{ color: inkFaint, textDecoration: "underline" }}
              >
                {brand.baseUrl.replace(/^https?:\/\//, "")}
              </Link>
              <br />
              Questions? Contact{" "}
              <Link
                href={`mailto:${brand.supportEmail}`}
                style={{ color: inkFaint, textDecoration: "underline" }}
              >
                {brand.supportEmail}
              </Link>
              .
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Small shared building blocks the templates reuse.
export function Heading({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontSize: 18,
        fontWeight: 600,
        color: ink,
        margin: "0 0 6px",
        letterSpacing: "-0.011em",
      }}
    >
      {children}
    </Text>
  );
}

export function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{ fontSize: 14, lineHeight: "1.6", color: "#374151", margin: "0 0 14px" }}
    >
      {children}
    </Text>
  );
}

export function Button({
  href,
  color,
  children,
}: {
  href: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        backgroundColor: color,
        // Navy text: white on the brand orange fails contrast (2.8:1 vs 5.7:1).
        color: "#17222F",
        textDecoration: "none",
        fontWeight: 600,
        fontSize: 14,
        padding: "11px 20px",
        borderRadius: 8,
        display: "inline-block",
      }}
    >
      {children}
    </Link>
  );
}

export const palette = { ink, inkFaint, inkMute, rule, bg, surface };
