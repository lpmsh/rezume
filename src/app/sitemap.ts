import type { MetadataRoute } from "next";
import { getSitemapEntries, registerSitemapSource } from "@/lib/seo/sitemap";
import { guideSitemapRoutes } from "@/lib/content/guides";

// Register guide pages (index + every content file) as a sitemap source.
registerSitemapSource(guideSitemapRoutes);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return getSitemapEntries();
}
