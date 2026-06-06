"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { track } from "@vercel/analytics";
import { Button } from "@/components/ui/button";
import { setGuideReferrer } from "@/lib/analytics";

/**
 * Reusable call-to-action pointing at the resume-link create flow. Used inline
 * within guide bodies, as the closing CTA on guide pages, and on the hub.
 *
 * On click it fires a `guide_cta_click` analytics event and records the source
 * page in a cookie, so a resume link created later in the funnel can be
 * attributed back to the guide that drove it. `source` is the guide slug (or
 * "guides-hub" on the hub).
 */
export function GuideCta({
  source = "guides",
  heading = "Create your resume link",
  subheading = "Upload a PDF, claim your slug, and share one link that never changes.",
}: {
  source?: string;
  heading?: string;
  subheading?: string;
}) {
  function handleClick() {
    setGuideReferrer(source);
    track("guide_cta_click", { source });
  }

  return (
    <div className="my-10 flex flex-col items-start gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-base font-semibold text-neutral-900">{heading}</p>
        <p className="mt-1 text-sm text-neutral-500">{subheading}</p>
      </div>
      <Link href="/signup" onClick={handleClick} className="shrink-0">
        <Button className="gap-1.5">
          Create your resume link
          <ArrowRight className="size-4" />
        </Button>
      </Link>
    </div>
  );
}
