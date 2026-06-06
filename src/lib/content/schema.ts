/**
 * Frontmatter schema for guide/landing content pages (`content/guides/*.mdx`).
 *
 * Authors write one MDX file per page; the YAML frontmatter at the top of that
 * file is parsed and validated against the shape below. Keeping the schema and
 * its runtime validation in one place means a malformed content file fails the
 * build with a clear message rather than rendering a broken page.
 */

/**
 * Content cluster a guide belongs to. Used for grouping and internal linking:
 * - `pillar`   — broad cornerstone topic (e.g. "online resume").
 * - `platform` — tied to a specific platform (e.g. "resume link for LinkedIn").
 * - `audience` — tied to a specific audience (e.g. "resume link for students").
 */
export type GuideCluster = "pillar" | "platform" | "audience";

const GUIDE_CLUSTERS: readonly GuideCluster[] = ["pillar", "platform", "audience"];

/** A single question/answer pair, rendered both as UI and as FAQPage JSON-LD. */
export interface GuideFaqItem {
  q: string;
  a: string;
}

/** One step of an optional how-to, emitted as HowTo JSON-LD. */
export interface GuideHowToStep {
  name: string;
  text: string;
}

/**
 * Optional structured how-to. When present on a guide, it's emitted as `HowTo`
 * JSON-LD in addition to the page's Article schema. The visible steps still
 * live in the MDX body — this is the machine-readable mirror.
 */
export interface GuideHowTo {
  name: string;
  description?: string;
  steps: GuideHowToStep[];
}

/** Validated frontmatter for a single guide page. */
export interface GuideFrontmatter {
  /** URL slug, e.g. "online-resume" → /guides/online-resume. */
  slug: string;
  /** Internal/display title (used in listings and as a fallback metaTitle). */
  title: string;
  /** `<title>` override. Falls back to `title` when omitted. */
  metaTitle?: string;
  /** Meta description for search/social. */
  metaDescription: string;
  /** Visible page heading (the single H1). */
  h1: string;
  cluster: GuideCluster;
  /** Primary keyword the page targets. Informational; not rendered. */
  targetKeyword?: string;
  /** Slugs of related guides, surfaced in the related-links section. */
  relatedSlugs: string[];
  /** Q&A pairs for the FAQ accordion + FAQPage structured data. */
  faq: GuideFaqItem[];
  /** Optional machine-readable how-to, emitted as HowTo JSON-LD. */
  howTo?: GuideHowTo;
  /** ISO 8601 date the content was last updated. */
  updatedAt: string;
}

function fail(slug: string, message: string): never {
  throw new Error(`Invalid frontmatter in content/guides/${slug}.mdx: ${message}`);
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

/**
 * Validate and normalise raw frontmatter (from gray-matter) into a typed
 * `GuideFrontmatter`. `fileSlug` is the filename without extension and is used
 * as the canonical slug, so a `slug` key in the frontmatter is optional but, if
 * present, must match the filename.
 */
export function validateFrontmatter(
  fileSlug: string,
  data: Record<string, unknown>,
): GuideFrontmatter {
  const slugField = asString(data.slug);
  if (slugField && slugField !== fileSlug) {
    fail(fileSlug, `"slug" (${slugField}) must match the filename (${fileSlug})`);
  }

  const title = asString(data.title) ?? fail(fileSlug, `"title" is required`);
  const metaDescription =
    asString(data.metaDescription) ?? fail(fileSlug, `"metaDescription" is required`);
  const h1 = asString(data.h1) ?? fail(fileSlug, `"h1" is required`);

  const cluster = asString(data.cluster);
  if (!cluster || !GUIDE_CLUSTERS.includes(cluster as GuideCluster)) {
    fail(fileSlug, `"cluster" must be one of ${GUIDE_CLUSTERS.join(", ")}`);
  }

  const updatedAt = asString(data.updatedAt) ?? fail(fileSlug, `"updatedAt" is required`);
  if (Number.isNaN(Date.parse(updatedAt))) {
    fail(fileSlug, `"updatedAt" (${updatedAt}) is not a valid ISO date`);
  }

  const relatedSlugs = data.relatedSlugs ?? [];
  if (!Array.isArray(relatedSlugs) || relatedSlugs.some((s) => typeof s !== "string")) {
    fail(fileSlug, `"relatedSlugs" must be an array of strings`);
  }

  const rawFaq = data.faq ?? [];
  if (!Array.isArray(rawFaq)) {
    fail(fileSlug, `"faq" must be an array of { q, a } items`);
  }
  const faq: GuideFaqItem[] = rawFaq.map((item, i) => {
    const q = asString((item as Record<string, unknown>)?.q);
    const a = asString((item as Record<string, unknown>)?.a);
    if (!q || !a) fail(fileSlug, `faq[${i}] must have non-empty "q" and "a"`);
    return { q, a };
  });

  let howTo: GuideHowTo | undefined;
  if (data.howTo != null) {
    const raw = data.howTo as Record<string, unknown>;
    const name = asString(raw.name) ?? fail(fileSlug, `"howTo.name" is required`);
    const rawSteps = raw.steps;
    if (!Array.isArray(rawSteps) || rawSteps.length === 0) {
      fail(fileSlug, `"howTo.steps" must be a non-empty array`);
    }
    const steps: GuideHowToStep[] = rawSteps.map((step, i) => {
      const stepName = asString((step as Record<string, unknown>)?.name);
      const text = asString((step as Record<string, unknown>)?.text);
      if (!stepName || !text) fail(fileSlug, `howTo.steps[${i}] needs "name" and "text"`);
      return { name: stepName, text };
    });
    howTo = { name, description: asString(raw.description), steps };
  }

  return {
    slug: fileSlug,
    title,
    metaTitle: asString(data.metaTitle),
    metaDescription,
    h1,
    cluster: cluster as GuideCluster,
    targetKeyword: asString(data.targetKeyword),
    relatedSlugs: relatedSlugs as string[],
    faq,
    howTo,
    updatedAt,
  };
}
