"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSlugCheck } from "@/hooks/use-slug-check";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export default function LandingPage() {
  const [slug, setSlug] = useState("");
  const { status, reason } = useSlugCheck(slug);
  const { data: session } = authClient.useSession();
  const router = useRouter();

  function handleClaim() {
    if (status === "available") {
      router.push(`/signup?slug=${encodeURIComponent(slug)}`);
    }
  }

  return (
    <div className="w-full min-h-dvh flex flex-col items-center">
      <div className="px-4 py-4 max-w-xl w-full flex flex-col min-h-dvh">
        {/* Header */}
        <div className="w-full flex justify-between items-center">
          <Link href="/" className="flex items-center gap-x-2">
            <div className="size-5 bg-violet-500 rounded-md" />
            <span className="text-sm font-semibold text-black">Rezume</span>
          </Link>
          <div className="flex items-center gap-x-3 text-sm">
            {session ? (
              <Link href="/app">
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-neutral-500 hover:text-black transition-colors"
                >
                  Log in
                </Link>
                <Link href="/signup">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Hero — centered vertically */}
        <div className="flex-1 flex flex-col justify-center pb-32">
          <p className="text-neutral-800 text-base leading-relaxed">
            One link for your resume. Upload a PDF, claim your URL, share it
            anywhere. Update anytime, the link never changes.
          </p>

          {/* Slug claim */}
          <div className="flex flex-col gap-2 pt-5">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center h-9 rounded-lg border border-neutral-200 px-3 transition-colors focus-within:border-violet-400">
                <span className="shrink-0 text-sm text-neutral-400">
                  rezume.so/
                </span>
                <input
                  className="flex-1 min-w-0 bg-transparent px-0.5 text-sm outline-none placeholder:text-neutral-300"
                  placeholder="yourname"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleClaim()}
                />
                {slug.length >= 3 && (
                  <div className="shrink-0">
                    {status === "checking" && (
                      <div className="size-3.5 animate-spin rounded-full border-2 border-neutral-200 border-t-violet-500" />
                    )}
                    {status === "available" && (
                      <Check className="size-3.5 text-emerald-500" />
                    )}
                    {status === "unavailable" && (
                      <X className="size-3.5 text-red-400" />
                    )}
                  </div>
                )}
              </div>
              <Button
                size="sm"
                className="h-9"
                onClick={handleClaim}
                disabled={status !== "available"}
              >
                Claim
              </Button>
            </div>

            <p
              className={`text-xs h-4 ${
                slug.length >= 3 && status === "available"
                  ? "text-emerald-600"
                  : slug.length >= 3 && status === "unavailable"
                    ? "text-red-500"
                    : "invisible"
              }`}
            >
              {slug.length >= 3 && status === "available"
                ? `rezume.so/${slug} is available`
                : slug.length >= 3 && status === "unavailable"
                  ? reason
                  : "\u00A0"}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pb-4 text-center text-xs text-neutral-400">
          made with ❤️ by{" "}
          <a
            href="https://x.com/lmon_25"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-neutral-300 underline-offset-2 hover:text-neutral-600 transition-colors"
          >
            Liam
          </a>
        </div>
      </div>
    </div>
  );
}
