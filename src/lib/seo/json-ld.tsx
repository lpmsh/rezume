import { SITE_NAME, SITE_URL, TWITTER_HANDLE, absoluteUrl } from "./config";

/**
 * Minimal structural type for a schema.org node. Helpers below return objects
 * shaped to validate in Google's Rich Results Test; the index signature keeps
 * them extensible without fighting the type system.
 */
export type JsonLdObject = {
  "@context"?: string | string[];
  "@type": string | string[];
  [key: string]: unknown;
};

const SCHEMA_CONTEXT = "https://schema.org";

/**
 * Renders one or more schema.org nodes as a JSON-LD `<script>` tag.
 * Drop this anywhere in a server component's tree (head or body — Google reads
 * both). Pass a single object or an array of objects.
 *
 * The `@context` is injected automatically if absent.
 */
export function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  const nodes = (Array.isArray(data) ? data : [data]).map((node) => ({
    "@context": SCHEMA_CONTEXT,
    ...node,
  }));
  const json = nodes.length === 1 ? nodes[0] : nodes;

  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe to inline; escape `<` to be defensive
      // against breaking out of the script tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(json).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/** schema.org Organization node for the site/brand. */
export function organizationSchema(overrides: Partial<JsonLdObject> = {}): JsonLdObject {
  return {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/favicon.ico"),
    sameAs: [`https://x.com/${TWITTER_HANDLE.replace(/^@/, "")}`],
    ...overrides,
  };
}

/** schema.org WebSite node. Include on the homepage. */
export function websiteSchema(overrides: Partial<JsonLdObject> = {}): JsonLdObject {
  return {
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    ...overrides,
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

/** schema.org FAQPage node from a list of Q&A pairs. */
export function faqPageSchema(items: FaqItem[]): JsonLdObject {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export interface ArticleSchemaInput {
  title: string;
  description?: string;
  /** Canonical path or absolute URL of the article. */
  url: string;
  image?: string;
  /** ISO 8601 date string. */
  datePublished?: string;
  /** ISO 8601 date string. */
  dateModified?: string;
  authorName?: string;
}

/** schema.org Article node for blog/content pages. */
export function articleSchema(input: ArticleSchemaInput): JsonLdObject {
  const url = absoluteUrl(input.url);
  return {
    "@type": "Article",
    headline: input.title,
    description: input.description,
    image: input.image ? absoluteUrl(input.image) : undefined,
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: input.authorName
      ? { "@type": "Person", name: input.authorName }
      : { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: organizationSchema(),
  };
}

export interface HowToStep {
  name: string;
  text: string;
  url?: string;
  image?: string;
}

export interface HowToSchemaInput {
  name: string;
  description?: string;
  steps: HowToStep[];
}

/** schema.org HowTo node for step-by-step guide pages. */
export function howToSchema(input: HowToSchemaInput): JsonLdObject {
  return {
    "@type": "HowTo",
    name: input.name,
    description: input.description,
    step: input.steps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: step.name,
      text: step.text,
      url: step.url ? absoluteUrl(step.url) : undefined,
      image: step.image ? absoluteUrl(step.image) : undefined,
    })),
  };
}

export interface BreadcrumbItem {
  name: string;
  /** Canonical path or absolute URL for this crumb. */
  url: string;
}

/** schema.org BreadcrumbList node from an ordered list of crumbs. */
export function breadcrumbSchema(items: BreadcrumbItem[]): JsonLdObject {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}
