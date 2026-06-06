/**
 * Client-side conversion attribution for the guide → signup/create funnel.
 *
 * A guide's CTA links to `/signup?ref=<source>`. The signup page reads that
 * param and records it in a short-lived cookie. That cookie survives the Google
 * OAuth round-trip, so when the resume link is finally created (slug claim) we
 * can attribute the conversion back to the guide that drove it. Pair with
 * `@vercel/analytics` `track()` events: `guide_cta_click` and
 * `resume_link_created`.
 *
 * Browser-only: these touch `document.cookie`; call from client components.
 */

const REFERRER_COOKIE = "rz_ref";
const MAX_AGE_SECONDS = 60 * 60 * 24; // 1 day, long enough to finish signup.

/** Record the guide (or hub) a CTA click came from. */
export function setGuideReferrer(source: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${REFERRER_COOKIE}=${encodeURIComponent(
    source,
  )};path=/;max-age=${MAX_AGE_SECONDS};samesite=lax`;
}

/** Read the attributed guide referrer, or null if none. */
export function readGuideReferrer(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${REFERRER_COOKIE}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(REFERRER_COOKIE.length + 1)) || null;
}

/** Clear the referrer cookie after the conversion is attributed. */
export function clearGuideReferrer(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${REFERRER_COOKIE}=;path=/;max-age=0`;
}
