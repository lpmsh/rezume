## 1. Database & Models

- [x] 1.1 Add Resume and ResumeView models to Prisma schema with all fields, relations, and `@@unique([slug, namedSlug])` constraint
- [x] 1.2 Create reserved slugs constant array and slug validation utility (format check, reserved check, normalize to lowercase)
- [x] 1.3 Run Prisma migration to create Resume and ResumeView tables (schema updated, client generated — run `npx prisma migrate dev` when DB is connected)
- [x] 1.4 Install and configure Upstash Redis SDK (`@upstash/redis`) with env vars

## 2. Auth & Middleware

- [x] 2.1 Create login page at `/login` with email/password form using better-auth client
- [x] 2.2 Create sign-up page at `/signup` with email/password form, accepting optional `slug` query param to pre-fill
- [x] 2.3 Add Next.js middleware to protect `/app/*` routes — redirect unauthenticated users to `/login`

## 3. Slug Availability API

- [x] 3.1 Create `GET /api/slug/check` endpoint — validates format, checks reserved list, queries DB, returns `{ available, reason? }`
- [x] 3.2 Create React hook `useSlugCheck` with debounced input that calls the check endpoint and returns availability state

## 4. Upload API

- [x] 4.1 Create `POST /api/upload` route — accept multipart form data, validate auth, validate PDF (type + 5MB limit), upload to R2, create/update Resume record
- [x] 4.2 Add re-upload logic — if user already has a resume for the slug, delete old R2 object, upload new file, update Resume record
- [x] 4.3 Add upload rate limiting with Upstash Redis (10 uploads/hour/user)

## 5. Resume Management API

- [x] 5.1 Create `GET /api/resumes` endpoint — return authenticated user's resumes with view counts
- [x] 5.2 Create `PATCH /api/resumes/[id]` endpoint — update displayName (with ownership check)
- [x] 5.3 Create `DELETE /api/resumes/[id]` endpoint — delete R2 object, ResumeViews, and Resume record (with ownership check)
- [x] 5.4 Create `GET /api/resumes/[id]/download` endpoint — return presigned R2 URL with Content-Disposition header using displayName

## 6. Landing Page

- [x] 6.1 Build landing page at `/` with hero section, slug input field with live URL preview (`rezume.so/{input}`), and "Claim your link" CTA
- [x] 6.2 Integrate `useSlugCheck` hook for real-time availability indicator (green checkmark / red taken)
- [x] 6.3 Wire CTA button to navigate to `/signup?slug={claimedSlug}`

## 7. Onboarding Flow

- [x] 7.1 Wire sign-up page to read `slug` query param, display it as the claimed slug, and associate it with the user after registration
- [x] 7.2 Create first-upload page at `/app/upload` with drag-and-drop PDF upload zone, display name input, and submit button
- [x] 7.3 After sign-up, redirect to `/app/upload` for first resume upload

## 8. Dashboard

- [x] 8.1 Build dashboard page at `/app` showing resume list — display name, public link with copy button, view count, last updated
- [x] 8.2 Implement copy-link button with clipboard API and brief "Copied!" toast
- [x] 8.3 Add re-upload button that opens file picker and calls upload API to replace existing resume
- [x] 8.4 Add inline edit for display name with save (calls PATCH endpoint)
- [x] 8.5 Add delete button with confirmation dialog (calls DELETE endpoint)
- [x] 8.6 Handle empty state — show upload prompt when user has no resumes

## 9. Public Resume Page

- [x] 9.1 Create dynamic route `/[slug]/page.tsx` — fetch Resume by slug (where namedSlug is null, isPublic true), return 404 if not found
- [x] 9.2 Render inline PDF viewer (iframe/embed with presigned R2 URL) filling viewport width
- [x] 9.3 Add download button that triggers file download with `Content-Disposition: attachment; filename={displayName}.pdf`
- [x] 9.4 Add "Powered by rezume.so" footer linking to landing page

## 10. View Counter

- [x] 10.1 Create view counting utility — hash IP, check Redis key `view:{resumeId}:{ipHash}`, set with 24h TTL if new, increment viewCount, create ResumeView
- [x] 10.2 Integrate view counter into public resume page server component — call on each page load
- [x] 10.3 Add owner exclusion — skip counting if authenticated user's ID matches resume owner
- [x] 10.4 Add bot filtering — skip counting if User-Agent matches common bot patterns (Googlebot, Bingbot, etc.)
