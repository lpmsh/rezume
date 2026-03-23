# rezume.so — MVP Checklist

🌐 Domain: rezume.so — purchase on Porkbun. Stack: Next.js, better-auth, Prisma, Postgres, Cloudflare R2, Tailwind, shadcn, Vercel.

 

## 🛒 Before You Start

- [ ] Purchase rezume.so on Porkbun
- [ ] Create Cloudflare account + R2 bucket
- [ ] Create Vercel project
- [ ] Provision Postgres database (Neon / Supabase / Railway)
- [ ] Create Upstash account (Redis for rate limiting)

## 🏗 Project Setup

- [ ] Init Next.js app (App Router, TypeScript)
- [ ] Install & configure Tailwind + shadcn/ui
- [ ] Install & configure Prisma + connect Postgres
- [ ] Install & configure better-auth
- [ ] Set up Cloudflare R2 bucket + SDK
- [ ] Configure .env (DB, R2, auth secret)
- [ ] Configure app.rezume.so subdomain on Vercel (dashboard)
- [ ] Configure rezume.so root on Vercel (public pages)

## 🗄 Database

- [ ] User model (better-auth compatible)
- [ ] Resume model — id, userId, displayName, slug, r2Key, fileSize, mimeType, isPublic, viewCount
- [ ] ResumeView model — id, resumeId, ip, userAgent, viewedAt
- [ ] Reserved slugs blocklist (app, www, api, admin, login, signup, pricing...)
- [ ] Prisma migrations

## 🔐 Auth

- [ ] better-auth setup (email + password)
- [ ] GitHub OAuth (optional)
- [ ] Auth middleware protecting /app/* routes

## 📤 Upload

- [ ] R2 upload API route (POST /api/upload)
- [ ] File validation (PDF only, max 5MB)
- [ ] Save resume record to DB
- [ ] Re-upload flow (replace file, same slug)
- [ ] Rate limiting on upload (Upstash)

## 🌐 Public Resume Page

- [ ] Route: rezume.so/[slug] — fetch resume by slug
- [ ] PDF inline viewer (iframe)
- [ ] Download button — Content-Disposition: attachment; filename=DisplayName.pdf
- [ ] View counter (IP + Redis dedup, 24hr window, exclude owner)
- [ ] 404 if slug not found or resume private
- [ ] Powered by rezume.so footer

## 🖥 Dashboard (app.rezume.so)

- [ ] Landing/marketing page at rezume.so
- [ ] Slug claim input on landing page (cal.com style)
- [ ] Sign up flow — slug pre-filled after claiming
- [ ] Upload page — first resume after signup
- [ ] Dashboard — resume list, copy link, view count
- [ ] Edit display name
- [ ] Re-upload resume
- [ ] Delete resume
- [ ] Copy link button (one click)

## 🚀 Launch

- [ ] Deploy to Vercel
- [ ] Point rezume.so + app.rezume.so DNS to Vercel
- [ ] Test full flow end-to-end
- [ ] Post in r/Purdue
- [ ] Post in Purdue CS Discord / ACM

 