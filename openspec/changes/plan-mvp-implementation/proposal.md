## Why

Rezume has its infrastructure backbone (Next.js, better-auth, Prisma, R2 storage, shadcn components) but zero product functionality. Users can't claim a slug, upload a resume, or view a public link. The MVP needs to be built before fall recruiting season (August) to capture Purdue students during peak resume-sharing activity.

## What Changes

- Add `Resume` and `ResumeView` models to Prisma schema with slug-based lookups
- Add reserved slugs blocklist to prevent conflicts
- Build upload API route with PDF validation, R2 storage, and rate limiting
- Build public resume page at `/[slug]` with inline PDF viewer, download button, and view counting
- Build authenticated dashboard at `/app` with resume management (upload, re-upload, delete, copy link)
- Build landing page with cal.com-style slug claiming input
- Build sign-up/login flow with slug pre-fill from landing page
- Integrate Upstash Redis for view deduplication and upload rate limiting

## Capabilities

### New Capabilities
- `resume-model`: Prisma schema for Resume and ResumeView with slug uniqueness, reserved slugs blocklist
- `resume-upload`: API route for PDF upload/re-upload with validation, R2 storage, and rate limiting
- `public-resume-page`: Public `/[slug]` route with PDF viewer, download, view counting, and "Powered by" footer
- `dashboard`: Authenticated dashboard with resume list, copy link, view count, re-upload, and delete
- `onboarding-flow`: Landing page slug claim, sign-up with slug pre-fill, first-upload prompt
- `view-counter`: Redis-backed IP-deduplicated view counting with bot filtering and owner exclusion

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- **Database**: New migration adding Resume, ResumeView tables and reserved slug validation
- **Dependencies**: Upstash Redis SDK (`@upstash/redis`) for rate limiting and view dedup
- **Routes**: New API routes (`/api/upload`, `/api/resumes`), new pages (`/[slug]`, `/app/*`, landing page)
- **Auth**: Middleware to protect `/app/*` routes
