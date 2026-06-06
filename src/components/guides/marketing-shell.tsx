import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Brand lockup shared by the marketing header. */
function Logo() {
  return (
    <Link href="/" className="flex items-center gap-x-2">
      <div className="size-5 rounded-md bg-violet-500" />
      <span className="text-sm font-semibold text-black">Rezume</span>
    </Link>
  );
}

/**
 * Page chrome for public marketing/content pages (guides index + guide pages).
 * Mirrors the landing page's header/footer so content pages feel native to the
 * product. Server component, no interactivity needed.
 */
export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full flex-col items-center">
      <header className="w-full border-b border-neutral-100">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4">
          <Logo />
          <div className="flex items-center gap-x-3 text-sm">
            <Link
              href="/guides"
              className="text-neutral-500 transition-colors hover:text-black"
            >
              Guides
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full flex-1">{children}</main>

      <footer className="w-full pb-8 pt-12 text-center text-xs text-neutral-400">
        made with ❤️ by{" "}
        <a
          href="https://x.com/lmon_25"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-neutral-300 underline-offset-2 transition-colors hover:text-neutral-600"
        >
          Liam
        </a>
      </footer>
    </div>
  );
}
