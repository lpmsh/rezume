/**
 * "Made with rezume.so" attribution footer shown on hosted resume pages for
 * free-plan users (the product's viral loop). Tasteful and unobtrusive: a small
 * pill anchored to the bottom-right that links back to the homepage. Paid plans
 * hide it (gated by the caller via `showsAttribution`).
 */
export function MadeWithRezume() {
  return (
    <a
      href="https://www.rezume.so/?ref=resume-footer"
      target="_blank"
      rel="noopener"
      className="fixed right-4 bottom-4 z-10 flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white/90 px-3 py-1.5 text-xs text-neutral-500 shadow-sm backdrop-blur transition-colors hover:text-neutral-800"
    >
      <span className="size-2.5 rounded-[3px] bg-violet-500" />
      Made with <span className="font-semibold text-neutral-700">rezume.so</span>
    </a>
  );
}
