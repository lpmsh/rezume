import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { SitemapRoute } from "@/lib/seo/sitemap";
import { type GuideFrontmatter, validateFrontmatter } from "./schema";

/**
 * Filesystem-backed loader for guide/landing pages. Content lives in
 * `content/guides/*.mdx`; adding a new page is a matter of dropping in one MDX
 * file, with no route code changes. All reads happen at build time (SSG), so this
 * module is server-only.
 */

const GUIDES_DIR = path.join(process.cwd(), "content", "guides");
const MDX_EXT = ".mdx";

/** A parsed guide: validated frontmatter plus its raw MDX body. */
export interface Guide {
  frontmatter: GuideFrontmatter;
  /** Raw MDX source (compile with `compileMDX` at render time). */
  body: string;
}

async function readGuideFile(slug: string): Promise<Guide> {
  const file = await fs.readFile(path.join(GUIDES_DIR, `${slug}${MDX_EXT}`), "utf8");
  const { data, content } = matter(file);
  return {
    frontmatter: validateFrontmatter(slug, data),
    body: content,
  };
}

/** Slugs of every guide, derived from the `.mdx` filenames. */
export async function getGuideSlugs(): Promise<string[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(GUIDES_DIR);
  } catch {
    return [];
  }
  return entries
    .filter((name) => name.endsWith(MDX_EXT))
    .map((name) => name.slice(0, -MDX_EXT.length));
}

/** Load a single guide by slug, or `null` if no such file exists. */
export async function getGuide(slug: string): Promise<Guide | null> {
  try {
    return await readGuideFile(slug);
  } catch (error) {
    // A genuinely missing file → null (404). Anything else (e.g. invalid
    // frontmatter) is a real error and should surface.
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

/**
 * All guides, sorted by most recently updated. Used by the index page and to
 * resolve related-slug references to their titles.
 */
export async function getAllGuides(): Promise<Guide[]> {
  const slugs = await getGuideSlugs();
  const guides = await Promise.all(slugs.map((slug) => readGuideFile(slug)));
  return guides.sort(
    (a, b) =>
      Date.parse(b.frontmatter.updatedAt) - Date.parse(a.frontmatter.updatedAt),
  );
}

/** Sitemap routes for every guide plus the guides index. */
export async function guideSitemapRoutes(): Promise<SitemapRoute[]> {
  const guides = await getAllGuides();
  return [
    { path: "/guides", changeFrequency: "weekly", priority: 0.7 },
    ...guides.map((guide) => ({
      path: `/guides/${guide.frontmatter.slug}`,
      lastModified: guide.frontmatter.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
