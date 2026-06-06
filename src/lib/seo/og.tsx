import { ImageResponse } from "next/og";
import type { ReactElement } from "react";
import { BRAND_COLOR, SITE_NAME } from "./config";

/** Standard Open Graph image dimensions. */
export const OG_SIZE = { width: 1200, height: 630 } as const;

export interface OgTemplateOptions {
  /** Large headline text. */
  title: string;
  /** Optional secondary line beneath the title. */
  subtitle?: string;
  /** Optional footer text (e.g. a URL). */
  footer?: string;
}

/**
 * Branded OG image template. Returns the JSX tree consumed by `ImageResponse`.
 * Shared between the generic `/api/og` route and per-entity routes so every
 * social card looks consistent.
 */
export function ogTemplate({
  title,
  subtitle,
  footer,
}: OgTemplateOptions): ReactElement {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fafafa",
        fontFamily: "sans-serif",
      }}
    >
      {/* Brand mark */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          position: "absolute",
          top: "48px",
          left: "64px",
        }}
      >
        <div
          style={{
            width: "28px",
            height: "28px",
            backgroundColor: BRAND_COLOR,
            borderRadius: "6px",
            display: "flex",
          }}
        />
        <span style={{ fontSize: "22px", fontWeight: 600, color: "#000" }}>
          {SITE_NAME}
        </span>
      </div>

      <div
        style={{
          fontSize: "64px",
          fontWeight: 700,
          color: "#0a0a0a",
          textAlign: "center",
          maxWidth: "960px",
          lineHeight: 1.15,
          display: "flex",
          padding: "0 64px",
        }}
      >
        {title}
      </div>

      {subtitle ? (
        <div
          style={{
            fontSize: "28px",
            fontWeight: 400,
            color: "#737373",
            marginTop: "20px",
            textAlign: "center",
            maxWidth: "840px",
            display: "flex",
            padding: "0 64px",
          }}
        >
          {subtitle}
        </div>
      ) : null}

      {footer ? (
        <div
          style={{
            position: "absolute",
            bottom: "48px",
            fontSize: "18px",
            color: "#a3a3a3",
            display: "flex",
          }}
        >
          {footer}
        </div>
      ) : null}
    </div>
  );
}

/** Build a complete `ImageResponse` from the branded template. */
export function ogImageResponse(options: OgTemplateOptions): ImageResponse {
  return new ImageResponse(ogTemplate(options), OG_SIZE);
}
