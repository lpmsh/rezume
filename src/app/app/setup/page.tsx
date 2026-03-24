"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSlugCheck } from "@/hooks/use-slug-check";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, X } from "lucide-react";

export default function SetupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-neutral-400">Loading...</p>
        </div>
      }
    >
      <SetupPageInner />
    </Suspense>
  );
}

function SetupPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSlug = searchParams.get("slug") ?? "";

  const [slug, setSlug] = useState(initialSlug);
  const { status, reason } = useSlugCheck(slug);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState("");
  const [autoClaimed, setAutoClaimed] = useState(false);

  // Auto-claim if slug came from Google OAuth callback
  useEffect(() => {
    if (initialSlug && status === "available" && !autoClaimed) {
      setAutoClaimed(true);
      claimSlug(initialSlug);
    }
  }, [initialSlug, status, autoClaimed]);

  // If user already has a slug (e.g. returning user), redirect to dashboard
  useEffect(() => {
    let cancelled = false;
    fetch("/api/user")
      .then((res) => res.ok && res.json())
      .then((data) => {
        if (!cancelled && data?.user?.slug) {
          router.replace("/app");
        }
      });
    return () => { cancelled = true; };
  }, [router]);

  async function claimSlug(slugToClaim: string) {
    setClaiming(true);
    setError("");

    const res = await fetch("/api/slug/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: slugToClaim }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to claim slug");
      setClaiming(false);
      return;
    }

    // Clear the pending_slug cookie
    document.cookie = "pending_slug=;path=/;max-age=0";

    router.push("/app");
  }

  async function handleClaim() {
    if (status !== "available") return;
    await claimSlug(slug);
  }

  return (
    <div className="w-full min-h-dvh flex flex-col items-center">
      <div className="px-4 py-4 max-w-4xl w-full">
        <div className="w-full flex justify-between items-center h-fit">
          <Link href="/home" className="flex items-center gap-x-3">
            <div className="size-6 bg-violet-500 rounded-md" />
            <h3 className="text-xl font-semibold text-black">Rezume</h3>
          </Link>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-20">
        {claiming ? (
          <p className="text-neutral-400">Claiming your link...</p>
        ) : (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Claim your link</CardTitle>
              <CardDescription>
                Choose a permanent URL for your resume. This can&apos;t be
                changed later.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-center h-9 rounded-lg border border-neutral-200 bg-neutral-50 px-4 transition-colors focus-within:border-violet-400 focus-within:bg-white">
                  <span className="shrink-0 text-sm text-black">
                    rezume.so/
                  </span>
                  <input
                    className="flex-1 min-w-0 bg-transparent px-1 text-sm outline-none placeholder:text-neutral-300"
                    placeholder="yourname"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleClaim()}
                    autoFocus
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

                {slug.length >= 3 && status === "available" && (
                  <p className="text-sm text-emerald-600">
                    rezume.so/{slug} is available
                  </p>
                )}
                {slug.length >= 3 && status === "unavailable" && (
                  <p className="text-sm text-red-500">{reason}</p>
                )}

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button
                  onClick={handleClaim}
                  disabled={status !== "available" || claiming}
                >
                  {claiming ? "Claiming..." : "Claim this link"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
