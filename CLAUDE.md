# Rezume

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4 + shadcn/ui
- Prisma 7 + PostgreSQL
- Cloudflare R2 for PDF storage
- Upstash Redis for rate limiting and view deduplication
- better-auth for authentication (Google OAuth)
- Deployed on Vercel

## Commands

- `bun dev` — start dev server
- `bun run build` — production build (runs prisma generate + migrate + next build)
- `bun run lint` — eslint
- `bun run db:migrate` — run prisma migrations
- `bun run db:studio` — open prisma studio
