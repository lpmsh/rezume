import { BarChart3, Link2, Sparkles } from "lucide-react";

/**
 * The three core value props of a hosted resume link. Surfaced on every guide
 * page to reinforce the product's edge over emailing a PDF attachment.
 */
const VALUE_PROPS = [
  {
    icon: BarChart3,
    title: "Built-in view tracking",
    body: "See when your resume is opened. A PDF attachment can never tell you that.",
  },
  {
    icon: Link2,
    title: "One stable URL",
    body: 'Update your resume anytime and the link stays the same. No more "final_v3.pdf".',
  },
  {
    icon: Sparkles,
    title: "Cleaner than an attachment",
    body: "Share a tidy link that opens instantly in any browser, on any device.",
  },
] as const;

export function ValueProps() {
  return (
    <div className="my-10 grid gap-4 sm:grid-cols-3">
      {VALUE_PROPS.map(({ icon: Icon, title, body }) => (
        <div
          key={title}
          className="rounded-2xl border border-neutral-200 bg-white p-5"
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <Icon className="size-4.5" />
          </div>
          <p className="mt-3 text-sm font-semibold text-neutral-900">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-neutral-500">{body}</p>
        </div>
      ))}
    </div>
  );
}
