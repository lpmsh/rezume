
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

## License

MIT
