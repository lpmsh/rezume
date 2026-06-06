import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // App, auth, and API routes are non-public, so keep them out of the index.
        // Individual resume pages (`/[slug]`) opt out via per-page `noindex`.
        disallow: ["/app", "/login", "/signup", "/api"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
