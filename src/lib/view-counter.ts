import { createHash } from "crypto";
import { redis } from "./redis";
import { prisma } from "./prisma";

const BOT_PATTERNS = [
  "googlebot",
  "bingbot",
  "slurp",
  "duckduckbot",
  "baiduspider",
  "yandexbot",
  "sogou",
  "facebookexternalhit",
  "twitterbot",
  "linkedinbot",
  "whatsapp",
  "telegrambot",
  "bot",
  "crawler",
  "spider",
  "headlesschrome",
];

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BOT_PATTERNS.some((pattern) => ua.includes(pattern));
}

export async function trackView({
  resumeId,
  ownerId,
  viewerUserId,
  ip,
  userAgent,
}: {
  resumeId: string;
  ownerId: string;
  viewerUserId?: string;
  ip: string;
  userAgent: string;
}) {
  // Skip owner views
  if (viewerUserId && viewerUserId === ownerId) return;

  // Skip bot views
  if (isBot(userAgent)) return;

  const ipHash = hashIp(ip);
  const key = `view:${resumeId}:${ipHash}`;

  const exists = await redis.get(key);
  if (exists) return;

  // Set key with 24h TTL
  await redis.set(key, 1, { ex: 86400 });

  // Increment view count and create view record
  await Promise.all([
    prisma.resume.update({
      where: { id: resumeId },
      data: { viewCount: { increment: 1 } },
    }),
    prisma.resumeView.create({
      data: {
        resumeId,
        ipHash,
        userAgent: userAgent.slice(0, 500),
      },
    }),
  ]);
}
