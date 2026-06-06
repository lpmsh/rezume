import { ogImageResponse } from "@/lib/seo/og";
import { DEFAULT_TITLE } from "@/lib/seo/config";

export const runtime = "nodejs";

/**
 * Generic dynamic OG image. Renders the branded template from query params:
 *   /api/og?title=...&subtitle=...
 * Used by `buildMetadata({ image: { title, subtitle } })`.
 */
export function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title")?.slice(0, 120) || DEFAULT_TITLE;
    const subtitle = searchParams.get("subtitle")?.slice(0, 160) || undefined;

    return ogImageResponse({ title, subtitle, footer: "rezume.so" });
  } catch (e) {
    console.error("OG image generation failed:", e);
    return new Response(`OG image error: ${e}`, { status: 500 });
  }
}
