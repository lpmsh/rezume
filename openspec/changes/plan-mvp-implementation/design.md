## Context

Rezume's infrastructure is in place: Next.js App Router, better-auth (email/password + Google OAuth), Prisma with PostgreSQL, Cloudflare R2 with full upload/download/presigned-URL helpers, and 18 shadcn/ui components. The home page is still boilerplate. No Resume model, no API routes, no product pages exist yet.

The target architecture uses a single Next.js app with two logical surfaces:
- **Public**: `rezume.so/[slug]` for viewing resumes
- **Dashboard**: `app.rezume.so` (or `/app/*` routes) for authenticated resume management

## Goals / Non-Goals

**Goals:**
- Ship a complete free-tier MVP: claim slug → sign up → upload PDF → share permanent link
- View counting with anti-inflation (Redis IP dedup, owner/bot exclusion)
- Clean re-upload flow that preserves the same URL
- Landing page that drives slug-claiming conversions

**Non-Goals:**
- Pro tier features (named slugs, password protection, analytics detail, footer removal)
- Custom domain support
- PDF parsing or resume content extraction
- Deployment, DNS, or Vercel configuration (handled outside code)
- Mobile app

## Decisions

### 1. Slug routing: catch-all `[slug]` at root vs subdomain split
**Decision**: Use Next.js dynamic route `/[slug]/page.tsx` at the root for public resume pages. Dashboard lives under `/app/*` routes (later mapped to `app.rezume.so` via Vercel rewrites).

**Why**: Keeps the URL structure clean (`rezume.so/liam`) without needing multi-tenant subdomain routing in Next.js. Reserved slugs blocklist prevents collisions with app routes.

### 2. File upload: server action vs API route
**Decision**: Use a Next.js API route (`POST /api/upload`) that accepts multipart form data, validates the file server-side, uploads to R2 using the existing `uploadResume()` helper, and creates/updates the Resume record.

**Why**: API routes give explicit control over response codes, headers, and streaming. The R2 helper already exists in `src/lib/r2.ts`. Presigned URLs are available but add client-side complexity not needed for MVP.

**Alternative considered**: Client-side upload via presigned URL — deferred because it adds complexity (two-step flow, orphan cleanup) without meaningful benefit at MVP scale.

### 3. View counting: Upstash Redis for dedup
**Decision**: On each public page view, hash the viewer IP, check Redis key `view:{resumeId}:{ipHash}`. If absent, set with 24h TTL, increment `viewCount` on the Resume record, and insert a `ResumeView` row. Skip if viewer is the resume owner (check session). Filter common bot User-Agents.

**Why**: Redis gives fast, ephemeral dedup without bloating the database. 24h window prevents refresh-spam while still counting repeat visitors across days.

### 4. Auth middleware
**Decision**: Use Next.js middleware to protect all `/app/*` routes by checking the better-auth session. Unauthenticated requests redirect to `/login`.

**Why**: Centralized protection without per-page auth checks. better-auth already sets session cookies.

### 5. Slug validation
**Decision**: Validate slugs against a static blocklist array in code (not a DB table). Slugs must be 3-30 chars, alphanumeric + hyphens, lowercase. Check availability via DB query on the Resume table's `slug` field.

**Why**: The blocklist is small (~30 entries) and rarely changes — a code constant is simpler than a DB table. Real-time availability check happens via a lightweight API endpoint.

## Risks / Trade-offs

- **Slug squatting** → No mitigation in MVP. Could add reclaim policy later if inactive accounts hold desirable slugs.
- **R2 orphan files on failed DB writes** → Accept for MVP. Upload writes to R2 first, then DB. If DB write fails, the R2 object is orphaned. Could add cleanup job later.
- **View count accuracy** → IP hashing + 24h window is "good enough." Shared IPs (campus WiFi) will undercount. Acceptable for MVP.
- **Rate limiting scope** → Start with upload rate limiting only (Upstash). Page view rate limiting deferred.
