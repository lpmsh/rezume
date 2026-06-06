import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { JsonLd, breadcrumbSchema, buildMetadata } from "@/lib/seo";
import { getAllGuides, type Guide } from "@/lib/content/guides";
import type { GuideCluster } from "@/lib/content/schema";
import { MarketingShell } from "@/components/guides/marketing-shell";
import { GuideCta } from "@/components/guides/guide-cta";

export const dynamic = "force-static";

export const metadata: Metadata = buildMetadata({
  title: "Resume Link Guides: Share Your Resume Online | Rezume",
  absoluteTitle: true,
  description:
    "Guides on how to create a resume link and share your resume online: for LinkedIn, email, job applications, and your profession. One link, always current.",
  canonical: "/guides",
  image: { title: "Resume Link Guides", subtitle: "Share your resume online" },
});

/**
 * Display config for each content cluster, in the order they appear on the hub.
 * Adding a guide to a new cluster only requires the cluster to exist here.
 */
const CLUSTER_SECTIONS: {
  key: GuideCluster;
  title: string;
  blurb: string;
}[] = [
  {
    key: "pillar",
    title: "Start here",
    blurb:
      "The core guides on putting your resume online and turning it into one shareable link.",
  },
  {
    key: "platform",
    title: "Where to share your resume link",
    blurb:
      "Add your link to the places recruiters actually look, and do it the right way.",
  },
  {
    key: "audience",
    title: "Resume link guides by profession",
    blurb: "Tailored advice for how your field shares a resume.",
  },
];

function GuideCard({ frontmatter }: { frontmatter: Guide["frontmatter"] }) {
  return (
    <Link
      href={`/guides/${frontmatter.slug}`}
      className="group rounded-2xl border border-neutral-200 bg-white p-5 transition-colors hover:border-violet-200 hover:bg-violet-50/40"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-base font-semibold text-neutral-900">
          {frontmatter.title}
        </p>
        <ArrowUpRight className="size-4 shrink-0 text-neutral-300 transition-colors group-hover:text-violet-500" />
      </div>
      <p className="mt-1 line-clamp-2 text-sm text-neutral-500">
        {frontmatter.metaDescription}
      </p>
    </Link>
  );
}

export default async function GuidesIndexPage() {
  const guides = await getAllGuides();
  const byCluster = (cluster: GuideCluster) =>
    guides.filter((g) => g.frontmatter.cluster === cluster);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Guides", url: "/guides" },
        ])}
      />
      <MarketingShell>
        <div className="mx-auto w-full max-w-3xl px-4 py-10">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Resume link guides
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-neutral-500">
            Everything you need to create a resume link and share your resume
            online. One permanent URL you can put on LinkedIn, in email, and on
            every job application, and update anytime without re-sending a thing.
          </p>

          {CLUSTER_SECTIONS.map((section) => {
            const items = byCluster(section.key);
            if (items.length === 0) return null;
            return (
              <section key={section.key} className="mt-10">
                <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
                  {section.title}
                </h2>
                <p className="mt-1 text-sm text-neutral-500">{section.blurb}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {items.map((guide) => (
                    <GuideCard
                      key={guide.frontmatter.slug}
                      frontmatter={guide.frontmatter}
                    />
                  ))}
                </div>
              </section>
            );
          })}

          <GuideCta source="guides-hub" />
        </div>
      </MarketingShell>
    </>
  );
}
