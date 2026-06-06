import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { GuideFrontmatter } from "@/lib/content/schema";
import { MarketingShell } from "./marketing-shell";
import { ValueProps } from "./value-props";
import { GuideCta } from "./guide-cta";
import { FaqSection } from "./faq-section";
import { RelatedLinks, type RelatedLink } from "./related-links";

/** Crumbs above the H1: Home › Guides › <current page>. */
function Breadcrumbs({ title }: { title: string }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1 text-xs text-neutral-400"
    >
      <Link href="/" className="transition-colors hover:text-neutral-600">
        Home
      </Link>
      <ChevronRight className="size-3" />
      <Link href="/guides" className="transition-colors hover:text-neutral-600">
        Guides
      </Link>
      <ChevronRight className="size-3" />
      <span className="truncate text-neutral-500">{title}</span>
    </nav>
  );
}

/**
 * Shared layout for an individual guide page. Composes the page chrome,
 * breadcrumbs, H1, MDX body, and the standard value-prop / CTA / FAQ /
 * related-links sections. The MDX body is compiled by the route and passed in
 * as `children`.
 */
export function GuideLayout({
  frontmatter,
  relatedLinks,
  children,
}: {
  frontmatter: GuideFrontmatter;
  relatedLinks: RelatedLink[];
  children: React.ReactNode;
}) {
  const updated = new Date(frontmatter.updatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <MarketingShell>
      <article className="mx-auto w-full max-w-3xl px-4 py-10">
        <Breadcrumbs title={frontmatter.title} />

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
          {frontmatter.h1}
        </h1>
        <p className="mt-2 text-xs text-neutral-400">Updated {updated}</p>

        <ValueProps />

        {/* Compiled MDX body */}
        <div>{children}</div>

        <GuideCta source={frontmatter.slug} />

        <FaqSection items={frontmatter.faq} />

        <RelatedLinks links={relatedLinks} />
      </article>
    </MarketingShell>
  );
}
