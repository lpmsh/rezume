
<img width="1199" height="625" alt="Screenshot 2026-04-08 at 4 02 13 AM" src="https://github.com/user-attachments/assets/138cc2ea-bff1-42b8-a963-9945baf44830" />

# Rezume

Dead-simple resume hosting. Upload a PDF, claim a slug, share a permanent link.

Your resume lives at `rezume.so/yourname` — update the PDF anytime without changing the URL.

## Features

- Claim a unique slug (e.g. `rezume.so/liam`)
- Upload and replace PDF resumes
- Inline PDF viewer on public pages
- View counter with IP deduplication (no inflated numbers)
- Google OAuth sign-in
- Dashboard to manage your resumes

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Database**: PostgreSQL via Prisma 7
- **Storage**: Cloudflare R2
- **Auth**: better-auth (Google OAuth)
- **Cache**: Upstash Redis (rate limiting, view dedup)
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- [Bun](https://bun.sh)
- PostgreSQL database
- Cloudflare R2 bucket
- Upstash Redis instance
- Google OAuth credentials

### Setup

```bash
# Install dependencies
bun install

# Copy environment variables
cp .env.example .env
# Fill in your values in .env

# Run database migrations
bun run db:migrate

# Start development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

See [`.env.example`](.env.example) for all required variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret key |
| `R2_BUCKET_NAME` | R2 bucket name |
| `BETTER_AUTH_SECRET` | Auth secret (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | App URL (default: `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token |
| `NEXT_PUBLIC_BASE_URL` | Canonical site origin for metadata/canonical/sitemap/OG (default: `https://www.rezume.so`) |
| `GOOGLE_SITE_VERIFICATION` | _Optional._ Google Search Console "HTML tag" token (see below) |

## Project Structure

```
src/
├── app/
│   ├── [slug]/        # Public resume viewer
│   ├── app/           # Authenticated dashboard
│   ├── login/         # Login page
│   ├── signup/        # Signup page
│   └── api/           # API routes (upload, slug, resumes)
├── components/        # UI components (shadcn/ui + custom)
├── hooks/             # Custom React hooks
└── lib/               # Utilities (prisma, redis, r2, auth, slugs)
```

## SEO & Growth

The marketing/SEO content cluster lives under `/guides` (hub + pillar, platform,
and audience pages). Content is authored as MDX in `content/guides/*.mdx` — see
that directory and `src/lib/content/` for the schema. This section covers the
instrumentation around it.

### Google Search Console

Verification can be done two ways:

- **DNS (recommended, no code):** add the TXT record GSC gives you to the
  `rezume.so` DNS zone. **Manual — requires the domain owner.**
- **HTML tag (via env var):** in GSC, choose **Add property → URL prefix →
  HTML tag**, copy the `content="..."` value, and set it as
  `GOOGLE_SITE_VERIFICATION` in the Vercel project env. The app renders the
  `<meta name="google-site-verification">` tag automatically (see
  `src/lib/seo/metadata.ts`). Redeploy, then click **Verify** in GSC.

**Submit the sitemap** (manual, one-time, in the GSC UI — requires the account
owner): open **Sitemaps**, enter `sitemap.xml`, and submit. The sitemap is
generated at [`/sitemap.xml`](/sitemap.xml) by `src/app/sitemap.ts` and includes
the homepage, the `/guides` hub, and every guide, each with a `lastModified`
date pulled from the content's `updatedAt` frontmatter.

> Steps marked **manual** can't be automated from the repo — they need the
> Google account / domain owner.

### Analytics & conversion tracking

Uses [Vercel Analytics](https://vercel.com/docs/analytics) (already wired via
`<Analytics />` in the root layout). The Vercel dashboard shows **page views per
path**, so per-guide traffic is available out of the box (filter by
`/guides/...`).

The guide → signup funnel is tracked with two custom events
(`@vercel/analytics` `track()`):

| Event | Fired when | Properties |
|---|---|---|
| `guide_cta_click` | A guide/hub "Create your resume link" CTA is clicked | `source` (guide slug or `guides-hub`) |
| `resume_link_created` | A slug is successfully claimed (the resume link is created) | `source` (`guide` \| `direct`), `guide` (referring slug, when attributed) |

Attribution survives the Google OAuth round-trip via a short-lived `rz_ref`
cookie set on CTA click and read at creation (`src/lib/analytics.ts`). In the
Vercel Analytics **Events** view you can therefore report, per guide, both CTA
clicks and the resume links they converted into.

### "Made with rezume.so" attribution footer (viral loop)

Public hosted resume pages render a small "Made with rezume.so" footer linking
back to the site. It's gated by the user's `plan`: shown on `free` (default),
hidden for paid plans. See `src/lib/plan.ts` (`showsAttribution` / `PAID_PLANS`)
and `src/components/made-with-rezume.tsx`.

## License

MIT
