import Link from "next/link";
import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";

/**
 * Element overrides applied when compiling a guide's MDX body. Styling lives
 * here (rather than a typography plugin) so the prose matches the product's
 * minimal, neutral aesthetic and stays fully within the existing Tailwind v4
 * setup. Internal links route through `next/link` for client navigation.
 */
export const mdxComponents: MDXComponents = {
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      className="mt-10 mb-3 scroll-mt-24 text-xl font-semibold tracking-tight text-neutral-900"
      {...props}
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="mt-7 mb-2 text-base font-semibold text-neutral-900" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="my-4 text-[15px] leading-relaxed text-neutral-700" {...props} />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="my-4 ml-5 list-disc space-y-2 text-[15px] leading-relaxed text-neutral-700" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol className="my-4 ml-5 list-decimal space-y-2 text-[15px] leading-relaxed text-neutral-700" {...props} />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => <li className="pl-1" {...props} />,
  a: ({ href = "#", ...props }: ComponentPropsWithoutRef<"a">) => {
    const isInternal = href.startsWith("/");
    const className =
      "font-medium text-violet-600 underline decoration-violet-200 underline-offset-2 transition-colors hover:text-violet-700";
    return isInternal ? (
      <Link href={href} className={className} {...props} />
    ) : (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        {...props}
      />
    );
  },
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold text-neutral-900" {...props} />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="my-5 border-l-2 border-violet-200 pl-4 text-[15px] text-neutral-600 italic"
      {...props}
    />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code
      className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[13px] text-neutral-800"
      {...props}
    />
  ),
  hr: (props: ComponentPropsWithoutRef<"hr">) => (
    <hr className="my-8 border-neutral-200" {...props} />
  ),
};
