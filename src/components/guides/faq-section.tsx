import { ChevronDown } from "lucide-react";
import type { GuideFaqItem } from "@/lib/content/schema";

/**
 * Visible FAQ accordion. Built on native `<details>`/`<summary>` so it works
 * with zero client JS, keeping guide pages fully static and fast. The matching
 * `FAQPage` JSON-LD is emitted separately (see the guide route) from the same
 * frontmatter `faq` array.
 */
export function FaqSection({ items }: { items: GuideFaqItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="mb-4 text-xl font-semibold tracking-tight text-neutral-900">
        Frequently asked questions
      </h2>
      <div className="divide-y divide-neutral-200 border-y border-neutral-200">
        {items.map((item) => (
          <details key={item.q} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[15px] font-medium text-neutral-900 [&::-webkit-details-marker]:hidden">
              {item.q}
              <ChevronDown className="size-4 shrink-0 text-neutral-400 transition-transform group-open:rotate-180" />
            </summary>
            <p className="pb-4 text-[15px] leading-relaxed text-neutral-600">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
