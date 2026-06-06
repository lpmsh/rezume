import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import {
  JsonLd,
  articleSchema,
  breadcrumbSchema,
  buildMetadata,
  faqPageSchema,
  howToSchema,
  SITE_URL,
} from "@/lib/seo";
import { getAllGuides, getGuide, getGuideSlugs } from "@/lib/content/guides";
import { GuideLayout } from "@/components/guides/guide-layout";
import { mdxComponents } from "@/components/guides/mdx-components";
import type { RelatedLink } from "@/components/guides/related-links";

// Fully static: pre-render every guide at build time and 404 unknown slugs.
export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = await getGuideSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) return {};

  const { frontmatter } = guide;
  return buildMetadata({
    title: frontmatter.metaTitle ?? frontmatter.title,
    absoluteTitle: Boolean(frontmatter.metaTitle),
    description: frontmatter.metaDescription,
    canonical: `/guides/${frontmatter.slug}`,
    image: { title: frontmatter.h1, subtitle: "Rezume Guides" },
    ogType: "article",
  });
}

/** Resolve `relatedSlugs` into linkable cards, skipping any that don't exist. */
async function resolveRelatedLinks(slugs: string[]): Promise<RelatedLink[]> {
  if (slugs.length === 0) return [];
  const all = await getAllGuides();
  const bySlug = new Map(all.map((g) => [g.frontmatter.slug, g.frontmatter]));
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((fm) => fm !== undefined)
    .map((fm) => ({
      slug: fm.slug,
      title: fm.title,
      metaDescription: fm.metaDescription,
    }));
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) notFound();

  const { frontmatter, body } = guide;
  const { content } = await compileMDX({
    source: body,
    components: mdxComponents,
  });
  const relatedLinks = await resolveRelatedLinks(frontmatter.relatedSlugs);

  const canonical = `${SITE_URL}/guides/${frontmatter.slug}`;

  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            title: frontmatter.h1,
            description: frontmatter.metaDescription,
            url: canonical,
            datePublished: frontmatter.updatedAt,
            dateModified: frontmatter.updatedAt,
          }),
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Guides", url: "/guides" },
            { name: frontmatter.title, url: `/guides/${frontmatter.slug}` },
          ]),
          ...(frontmatter.faq.length > 0
            ? [faqPageSchema(frontmatter.faq.map((f) => ({ question: f.q, answer: f.a })))]
            : []),
          ...(frontmatter.howTo
            ? [
                howToSchema({
                  name: frontmatter.howTo.name,
                  description: frontmatter.howTo.description,
                  steps: frontmatter.howTo.steps,
                }),
              ]
            : []),
        ]}
      />
      <GuideLayout frontmatter={frontmatter} relatedLinks={relatedLinks}>
        {content}
      </GuideLayout>
    </>
  );
}
