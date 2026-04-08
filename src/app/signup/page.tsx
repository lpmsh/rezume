"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useSlugCheck } from "@/hooks/use-slug-check";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, X } from "lucide-react";

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-neutral-400">Loading...</p>
        </div>
      }
    >
      <SignupPageInner />
    </Suspense>
  );
}

function SignupPageInner() {
  const searchParams = useSearchParams();
  const initialSlug = searchParams.get("slug") ?? "";

  const [slug, setSlug] = useState(initialSlug);
  const { status: slugStatus, reason: slugReason } = useSlugCheck(slug);
  const [lastMessage, setLastMessage] = useState<{ text: string; type: "available" | "unavailable" } | null>(null);
  const [loading, setLoading] = useState(false);

  const slugReady = slugStatus === "available";

  // Track the last shown message so it persists during loading
  if (slug.length >= 3 && slugStatus === "available") {
    const text = `rezume.so/${slug} is available`;
    if (lastMessage?.text !== text) setLastMessage({ text, type: "available" });
  } else if (slug.length >= 3 && slugStatus === "unavailable" && slugReason) {
    if (lastMessage?.text !== slugReason) setLastMessage({ text: slugReason, type: "unavailable" });
  } else if (slug.length < 3 && lastMessage) {
    setLastMessage(null);
  }

  async function handleGoogleSignUp() {
    if (!slugReady) return;
    setLoading(true);

    // Store slug in cookie so we can claim it after OAuth callback
    document.cookie = `pending_slug=${encodeURIComponent(slug)};path=/;max-age=600;samesite=lax`;

    await authClient.signIn.social({
      provider: "google",
      callbackURL: `/app/setup?slug=${encodeURIComponent(slug)}`,
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Pick your link and sign up with Google
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Slug selection */}
            <div className="flex flex-col gap-1.5">
              <Label>Your link</Label>
              <div className="flex items-center h-9 rounded-lg border border-neutral-200 bg-neutral-50 px-3 transition-colors focus-within:border-violet-400 focus-within:bg-white">
                <span className="shrink-0 text-sm text-black">
                  rezume.so/
                </span>
                <input
                  className="flex-1 min-w-0 bg-transparent px-1 text-sm outline-none placeholder:text-neutral-300"
                  placeholder="yourname"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase())}
                />
                {slug.length >= 3 && (
                  <div className="shrink-0">
                    {slugStatus === "checking" && (
                      <div className="size-4 animate-spin rounded-full border-2 border-neutral-200 border-t-violet-500" />
                    )}
                    {slugStatus === "available" && (
                      <Check className="size-4 text-emerald-500" />
                    )}
                    {slugStatus === "unavailable" && (
                      <X className="size-4 text-red-400" />
                    )}
                  </div>
                )}
              </div>
              <div
                className="grid transition-[grid-template-rows] duration-200 ease-out"
                style={{
                  gridTemplateRows: lastMessage ? "1fr" : "0fr",
                }}
              >
                <div className="overflow-hidden">
                  <p
                    className={`text-xs pt-1.5 ${
                      lastMessage?.type === "available"
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    {lastMessage?.text}
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              className="w-full"
              onClick={handleGoogleSignUp}
              disabled={!slugReady || loading}
            >
              <GoogleIcon />
              <span className="ml-2">
                {loading ? "Redirecting..." : "Continue with Google"}
              </span>
            </Button>

            <p className="text-center text-sm text-neutral-500">
              Already have an account?{" "}
              <Link href="/login" className="text-violet-500 underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
