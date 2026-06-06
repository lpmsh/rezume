import type { MetadataRoute } from "next";
import { absoluteUrl } from "./config";

export type SitemapEntry = MetadataRoute.Sitemap[number];

export interface SitemapRoute {
  /** Path or absolute URL of the page. */
  path: string;
  /** ISO date or Date of last modification. */
  lastModified?: string | Date;
  changeFrequency?: SitemapEntry["changeFrequency"];
  /** 0.0–1.0 relative priority. */
  priority?: number;
}

/**
 * Static public, indexable routes. Other tiers extend coverage by registering
 * dynamic routes via `registerSitemapSource()` — keep this list to truly static
 * marketing pages.
 */
const STATIC_ROUTES: SitemapRoute[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
];

/**
 * Async sources that produce additional sitemap routes (e.g. a future blog
 * tier enumerating its posts from the DB). Each is called when the sitemap is
 * generated and its results are merged in.
 */
type SitemapSource = () => SitemapRoute[] | Promise<SitemapRoute[]>;
const dynamicSources: SitemapSource[] = [];

/**
 * Register a source of sitemap routes. Call this at module load from any tier
 * that owns public content pages so they appear in `/sitemap.xml`.
 */
export function registerSitemapSource(source: SitemapSource): void {
  dynamicSources.push(source);
}

function toEntry(route: SitemapRoute): SitemapEntry {
  return {
    url: absoluteUrl(route.path),
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  };
}

/**
 * Resolve every registered route into the shape Next.js expects for
 * `app/sitemap.ts`. De-duplicates by URL (first writer wins).
 */
export async function getSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const dynamic = (
    await Promise.all(dynamicSources.map((source) => source()))
  ).flat();

  const seen = new Set<string>();
  const entries: MetadataRoute.Sitemap = [];
  for (const route of [...STATIC_ROUTES, ...dynamic]) {
    const entry = toEntry(route);
    if (seen.has(entry.url)) continue;
    seen.add(entry.url);
    entries.push(entry);
  }
  return entries;
}
