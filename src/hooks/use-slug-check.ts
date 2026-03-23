"use client";

import { useEffect, useState, useRef } from "react";

type SlugStatus = "idle" | "checking" | "available" | "unavailable";

export function useSlugCheck(input: string, debounceMs = 300) {
  const [status, setStatus] = useState<SlugStatus>("idle");
  const [reason, setReason] = useState<string | undefined>();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!input || input.length < 3) {
      setStatus("idle");
      setReason(undefined);
      return;
    }

    setStatus("checking");

    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(
          `/api/slug/check?slug=${encodeURIComponent(input)}`,
          { signal: controller.signal }
        );
        const data = await res.json();

        if (controller.signal.aborted) return;

        if (data.available) {
          setStatus("available");
          setReason(undefined);
        } else {
          setStatus("unavailable");
          setReason(data.reason);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setStatus("idle");
      }
    }, debounceMs);

    return () => {
      clearTimeout(timer);
    };
  }, [input, debounceMs]);

  return { status, reason };
}
