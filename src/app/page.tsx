"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSlugCheck } from "@/hooks/use-slug-check";
import { Button } from "@/components/ui/button";
import { Check, X, Link2, Upload, Share2 } from "lucide-react";

export default function LandingPage() {
  const [slug, setSlug] = useState("");
  const { status, reason } = useSlugCheck(slug);
  const router = useRouter();

  function handleClaim() {
    if (status === "available") {
      router.push(`/signup?slug=${encodeURIComponent(slug)}`);
    }
  }

  return (
    <div className="w-full min-h-dvh flex flex-col items-center">
      <div className="px-4 py-4 max-w-4xl w-full">
        {/* Header */}
        <div className="w-full flex justify-between items-center h-fit">
          <Link href="/" className="flex items-center gap-x-3">
            <div className="size-6 bg-violet-500 rounded-md" />
            <h3 className="text-xl font-semibold text-black">Rezume</h3>
          </Link>
          <div className="flex items-center gap-x-2">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>

        {/* Hero */}
        <div className="w-full pt-16 md:max-w-[80%] select-none">
          <h1 className="font-heading text-5xl text-black text-left pb-1">
            Your Resume,
          </h1>
          <mark className="font-heading -py-0.5 rounded-md px-1 bg-violet-100 text-violet-500 text-5xl text-left">
            One Link Away
          </mark>

          <h2 className="text-neutral-500 text-lg font-medium pt-4">
            Upload a PDF, claim your personal URL, and share it everywhere.
            Update your resume anytime. The link never changes.
          </h2>

          {/* Slug claim */}
          <div className="flex flex-col gap-3 pt-6 max-w-lg">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center h-10 rounded-lg bg-neutral-50 border border-neutral-200 px-3 transition-colors focus-within:border-violet-400 focus-within:bg-white">
                <span className="shrink-0 text-sm text-black">
                  rezume.so/
                </span>
                <input
                  className="flex-1 min-w-0 bg-transparent px-1 text-sm outline-none placeholder:text-neutral-300"
                  placeholder="yourname"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleClaim()}
                />
                {slug.length >= 3 && (
                  <div className="shrink-0">
                    {status === "checking" && (
                      <div className="size-4 animate-spin rounded-full border-2 border-neutral-200 border-t-violet-500" />
                    )}
                    {status === "available" && (
                      <Check className="size-4 text-emerald-500" />
                    )}
                    {status === "unavailable" && (
                      <X className="size-4 text-red-400" />
                    )}
                  </div>
                )}
              </div>
              <Button
                className="h-10"
                onClick={handleClaim}
                disabled={status !== "available"}
              >
                Claim your link
              </Button>
            </div>

            {slug.length >= 3 && status === "available" && (
              <p className="text-sm text-emerald-600">
                rezume.so/{slug} is available
              </p>
            )}
            {slug.length >= 3 && status === "unavailable" && (
              <p className="text-sm text-red-500">{reason}</p>
            )}
          </div>
        </div>

        {/* How it works */}
        <div className="pt-24 w-full flex flex-col">
          <h1 className="font-heading text-5xl text-black text-left pb-1 select-none">
            How it{" "}
            <mark className="font-heading -py-0.5 rounded-md px-1 bg-violet-100 text-violet-500 text-5xl text-left">
              Works
            </mark>
          </h1>
          <div className="select-none rounded-[10px] grid md:grid-cols-3 w-full justify-items-center mt-6 gap-[2px] bg-neutral-100 p-[2px]">
            <div className="w-full flex flex-col items-center p-8 bg-white rounded-[8px] gap-3">
              <div className="size-10 rounded-full bg-violet-50 flex items-center justify-center">
                <Link2 className="size-5 text-violet-500" />
              </div>
              <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Step 1</span>
              <h3 className="font-semibold text-black text-lg">Claim your URL</h3>
              <p className="text-neutral-500 text-sm text-center leading-relaxed">
                Pick a personal link like{" "}
                <span className="text-violet-500 font-medium">rezume.so/yourname</span>{" "}
                and it&apos;s yours forever.
              </p>
            </div>
            <div className="w-full flex flex-col items-center p-8 bg-white rounded-[8px] gap-3">
              <div className="size-10 rounded-full bg-violet-50 flex items-center justify-center">
                <Upload className="size-5 text-violet-500" />
              </div>
              <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Step 2</span>
              <h3 className="font-semibold text-black text-lg">Upload your resume</h3>
              <p className="text-neutral-500 text-sm text-center leading-relaxed">
                Drop in a PDF. Swap it out whenever you want. The link stays the same.
              </p>
            </div>
            <div className="w-full flex flex-col items-center p-8 bg-white rounded-[8px] gap-3">
              <div className="size-10 rounded-full bg-violet-50 flex items-center justify-center">
                <Share2 className="size-5 text-violet-500" />
              </div>
              <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Step 3</span>
              <h3 className="font-semibold text-black text-lg">Share everywhere</h3>
              <p className="text-neutral-500 text-sm text-center leading-relaxed">
                Add it to your LinkedIn, portfolio, or email signature. One link, always up to date.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-8 pb-4 text-center text-sm text-neutral-400">
          Made with ❤️ by{" "}
          <a
            href="https://x.com/lmon_25"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 underline underline-offset-2 hover:text-black transition-colors"
          >
            Liam
          </a>
        </footer>
      </div>
    </div>
  );
}
