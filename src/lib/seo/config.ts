/**
 * Site-wide SEO configuration. Single source of truth for the canonical base
 * URL, brand strings, and default metadata. Per-page values are layered on top
 * of these defaults via `buildMetadata()`.
 */

/**
 * Canonical origin used for absolute URLs (canonical tags, OG images, sitemap).
 * Includes the `www` host to match the production deployment. No trailing slash.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.rezume.so"
).replace(/\/$/, "");

export const SITE_NAME = "Rezume";

/** Used for the title template suffix, e.g. "Pricing — Rezume". */
export const SITE_TITLE_SEPARATOR = "—";

export const DEFAULT_TITLE = "Rezume — Your resume, one link";

export const DEFAULT_DESCRIPTION =
  "Upload a PDF, claim your slug, share a permanent link. Update your resume, same URL, always.";

/** Twitter/X handle for the site, including the leading @. */
export const TWITTER_HANDLE = "@lmon_25";

/** Theme color used for the brand mark in OG images. */
export const BRAND_COLOR = "#8b5cf6";

/**
 * Resolve a path (or absolute URL) against the canonical site origin.
 * Returns an absolute URL string with no double slashes.
 */
export function absoluteUrl(pathOrUrl: string = "/"): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${path}`;
}
