# rezume.so — Project Context

<aside>
🌐 Dead-simple resume hosting. Upload a PDF, claim a slug, get a permanent link. The link never changes — update your resume, same URL.

</aside>

## What It Is

rezume.so lets users upload a PDF resume, claim a personal slug, and share a permanent public link. When they re-upload, the same URL serves the new file. No broken links, no re-uploading to job boards. Primary target: college students during recruiting season, starting at Purdue.

## URL Structure

```
rezume.so/[slug]        → primary resume (free)
rezume.so/[slug]/[name] → named resume (pro only)
app.rezume.so           → dashboard

Examples: rezume.so/liam, rezume.so/liam/swe
```

## Tech Stack

- Next.js (App Router, TypeScript), better-auth, Prisma, PostgreSQL
- Cloudflare R2 (file storage), Upstash Redis (rate limiting)
- Tailwind CSS + shadcn/ui, Vercel (deployment)

## Database Schema

```tsx
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now())
  resumes   Resume[]
}

model Resume {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  displayName String
  slug        String
  namedSlug   String?
  r2Key       String
  fileSize    Int
  mimeType    String
  isPublic    Boolean  @default(true)
  password    String?
  viewCount   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  views       ResumeView[]
  @@unique([slug, namedSlug])
}

model ResumeView {
  id        String   @id @default(cuid())
  resumeId  String
  resume    Resume   @relation(fields: [resumeId], references: [id])
  ipHash    String?
  userAgent String?
  viewedAt  DateTime @default(now())
}
```

## Onboarding Flow

1. Landing page — slug input field + Claim CTA (cal.com style)
2. Live slug availability check (green checkmark or taken)
3. Sign up — email + password or GitHub OAuth, slug pre-filled
4. Upload — full-screen prompt, set display/download filename
5. Dashboard — link, copy button, view count, re-upload

## Free vs Pro

- Free: 1 resume (root slug), custom filename, update in place, view count, public link
- Pro ($2-3/mo): multiple named resumes, detailed analytics, password protection, remove footer

## View Counter (Anti-Inflation)

```tsx
const key = `view:${resumeId}:${hashIp(ip)}`
const exists = await redis.get(key)
if (!exists) {
  await redis.set(key, 1, { ex: 86400 }) // 24hr TTL
  await db.resume.update({
    where: { id: resumeId },
    data: { viewCount: { increment: 1 } }
  })
}
// Never count owner views. Filter bots by User-Agent.
```

## Public Resume Page

- Route: rezume.so/[slug] — fetch by slug from DB
- Inline PDF viewer (iframe or PDF.js)
- Download: Content-Disposition: attachment; filename=DisplayName.pdf
- 404 if slug not found, deleted, or isPublic: false
- Footer: Powered by rezume.so (removable on Pro)

## Reserved Slugs

```
app, www, api, admin, login, signup, register, pricing, blog,
help, support, about, terms, privacy, contact, dashboard,
upload, settings, account, pro, billing, favicon, robots, sitemap
```

## Growth Strategy

- Powered by rezume.so footer on all public pages
- Cal.com-style slug claiming = FOMO + personalization hook
- Launch on r/Purdue, Purdue CS Discord, ACM newsletters
- Target before fall recruiting season (August) for maximum spike