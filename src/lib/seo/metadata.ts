import type { Metadata } from "next";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  SITE_NAME,
  SITE_TITLE_SEPARATOR,
  SITE_URL,
  TWITTER_HANDLE,
  absoluteUrl,
} from "./config";

export interface BuildMetadataOptions {
  /**
   * Page title. Rendered as `<title> — Rezume` unless `absoluteTitle` is set.
   * Omit to use the site default title.
   */
  title?: string;
  /** Render `title` verbatim without appending the site name. */
  absoluteTitle?: boolean;
  /** Meta description. Falls back to the site default. */
  description?: string;
  /**
   * Canonical path or absolute URL for this page (e.g. "/pricing").
   * Strongly recommended on every public page to avoid duplicate-content issues.
   */
  canonical?: string;
  /**
   * OG/Twitter image. Either an absolute/relative URL string, or
   * `{ title, subtitle }` to generate one via the dynamic OG endpoint.
   * Omit to use the site default OG image.
   */
  image?: string | { title: string; subtitle?: string };
  /** Open Graph type. Defaults to "website". */
  ogType?: "website" | "article" | "profile";
  /**
   * When true, emit `noindex, nofollow`. Use for auth/app and any
   * non-public route. Defaults to false (indexable).
   */
  noindex?: boolean;
  /** Extra keywords. Optional — modern Google largely ignores these. */
  keywords?: string[];
}

/** Build the dynamic OG image URL from a title/subtitle. */
function ogImageUrl(title: string, subtitle?: string): string {
  const params = new URLSearchParams({ title });
  if (subtitle) params.set("subtitle", subtitle);
  return absoluteUrl(`/api/og?${params.toString()}`);
}

const DEFAULT_OG_IMAGE = ogImageUrl(SITE_NAME, "Your resume, one link");

/**
 * Reusable metadata builder for Next.js App Router `generateMetadata` /
 * exported `metadata`. Applies sensible site-wide defaults (title template,
 * description, OG + Twitter card, canonical, robots) with per-page overrides.
 */
export function buildMetadata(options: BuildMetadataOptions = {}): Metadata {
  const {
    title,
    absoluteTitle,
    description = DEFAULT_DESCRIPTION,
    canonical,
    image,
    ogType = "website",
    noindex = false,
    keywords,
  } = options;

  const resolvedTitle = title
    ? absoluteTitle
      ? title
      : `${title} ${SITE_TITLE_SEPARATOR} ${SITE_NAME}`
    : DEFAULT_TITLE;

  let imageUrl: string;
  if (typeof image === "string") {
    imageUrl = absoluteUrl(image);
  } else if (image) {
    imageUrl = ogImageUrl(image.title, image.subtitle);
  } else {
    imageUrl = DEFAULT_OG_IMAGE;
  }

  const canonicalUrl = canonical ? absoluteUrl(canonical) : undefined;

  return {
    metadataBase: new URL(SITE_URL),
    title: resolvedTitle,
    description,
    keywords,
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    openGraph: {
      type: ogType,
      siteName: SITE_NAME,
      title: resolvedTitle,
      description,
      url: canonicalUrl,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: resolvedTitle }],
    },
    twitter: {
      card: "summary_large_image",
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title: resolvedTitle,
      description,
      images: [imageUrl],
    },
    robots: noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}
