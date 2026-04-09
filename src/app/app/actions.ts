"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export type AnalyticsData = {
  totalViews: number;
  last7Days: number;
  last30Days: number;
  viewsPerDay: Array<{
    date: string;
    count: number;
    byResume: Array<{ resumeId: string; displayName: string; count: number }>;
  }>;
  topReferrers: Array<{ referrer: string; count: number }>;
  deviceBreakdown: { mobile: number; desktop: number };
  resumes: Array<{ id: string; displayName: string }>;
};

export async function getSlugAnalytics(
  filterResumeId?: string
): Promise<AnalyticsData | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return null;

  const resumes = await prisma.resume.findMany({
    where: { userId: session.user.id },
    select: { id: true, displayName: true, viewCount: true },
  });

  if (resumes.length === 0) return null;

  const resumeIds = filterResumeId
    ? [filterResumeId]
    : resumes.map((r) => r.id);

  // Verify the filtered resume belongs to this user
  if (filterResumeId && !resumes.some((r) => r.id === filterResumeId)) {
    return null;
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const viewWhere = { resumeId: { in: resumeIds } };

  const [last7Days, last30Days, views30d, referrerGroups] = await Promise.all([
    prisma.resumeView.count({
      where: { ...viewWhere, viewedAt: { gte: sevenDaysAgo } },
    }),
    prisma.resumeView.count({
      where: { ...viewWhere, viewedAt: { gte: thirtyDaysAgo } },
    }),
    prisma.resumeView.findMany({
      where: { ...viewWhere, viewedAt: { gte: thirtyDaysAgo } },
      select: {
        resumeId: true,
        viewedAt: true,
        userAgent: true,
        referrer: true,
      },
    }),
    prisma.resumeView.groupBy({
      by: ["referrer"],
      where: viewWhere,
      _count: { referrer: true },
      orderBy: { _count: { referrer: "desc" } },
      take: 10,
    }),
  ]);

  // Build resume lookup
  const resumeMap = new Map(resumes.map((r) => [r.id, r.displayName]));

  // Build views per day for last 30 days with per-resume breakdown
  const dayCounts = new Map<string, { total: number; byResume: Map<string, number> }>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dayCounts.set(d.toISOString().slice(0, 10), { total: 0, byResume: new Map() });
  }
  for (const v of views30d) {
    const key = v.viewedAt.toISOString().slice(0, 10);
    const day = dayCounts.get(key);
    if (day) {
      day.total++;
      day.byResume.set(v.resumeId, (day.byResume.get(v.resumeId) ?? 0) + 1);
    }
  }

  const viewsPerDay = Array.from(dayCounts, ([date, day]) => ({
    date,
    count: day.total,
    byResume: Array.from(day.byResume, ([resumeId, count]) => ({
      resumeId,
      displayName: resumeMap.get(resumeId) ?? "Unknown",
      count,
    })),
  }));

  // Device breakdown
  let mobile = 0;
  let desktop = 0;
  for (const v of views30d) {
    const ua = (v.userAgent ?? "").toLowerCase();
    if (
      ua.includes("mobile") ||
      ua.includes("android") ||
      ua.includes("iphone")
    ) {
      mobile++;
    } else {
      desktop++;
    }
  }

  // Top referrers
  const topReferrers = referrerGroups.map((r) => ({
    referrer: r.referrer ?? "direct",
    count: r._count.referrer,
  }));

  // Total views: sum across relevant resumes
  const totalViews = filterResumeId
    ? resumes.find((r) => r.id === filterResumeId)?.viewCount ?? 0
    : resumes.reduce((sum, r) => sum + r.viewCount, 0);

  return {
    totalViews,
    last7Days,
    last30Days,
    viewsPerDay,
    topReferrers,
    deviceBreakdown: { mobile, desktop },
    resumes: resumes.map((r) => ({ id: r.id, displayName: r.displayName })),
  };
}
