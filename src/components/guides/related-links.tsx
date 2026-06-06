import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export interface RelatedLink {
  slug: string;
  title: string;
  metaDescription: string;
}

/**
 * Internal links to related guides. Strengthens topical clustering and gives
 * readers an onward path. Resolved from the page's `relatedSlugs` frontmatter.
 */
export function RelatedLinks({ links }: { links: RelatedLink[] }) {
  if (links.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="mb-4 text-xl font-semibold tracking-tight text-neutral-900">
        Related guides
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <Link
            key={link.slug}
            href={`/guides/${link.slug}`}
            className="group rounded-2xl border border-neutral-200 bg-white p-5 transition-colors hover:border-violet-200 hover:bg-violet-50/40"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-neutral-900">
                {link.title}
              </p>
              <ArrowUpRight className="size-4 shrink-0 text-neutral-300 transition-colors group-hover:text-violet-500" />
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-neutral-500">
              {link.metaDescription}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
