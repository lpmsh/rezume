import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const resume = await prisma.resume.findUnique({ where: { id } });
  if (!resume || resume.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [last7Days, last30Days, views30d, referrerGroups] = await Promise.all([
    prisma.resumeView.count({
      where: { resumeId: id, viewedAt: { gte: sevenDaysAgo } },
    }),
    prisma.resumeView.count({
      where: { resumeId: id, viewedAt: { gte: thirtyDaysAgo } },
    }),
    prisma.resumeView.findMany({
      where: { resumeId: id, viewedAt: { gte: thirtyDaysAgo } },
      select: { viewedAt: true, userAgent: true, referrer: true },
    }),
    prisma.resumeView.groupBy({
      by: ["referrer"],
      where: { resumeId: id },
      _count: { referrer: true },
      orderBy: { _count: { referrer: "desc" } },
      take: 10,
    }),
  ]);

  // Build views per day for last 30 days
  const dayCounts = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dayCounts.set(d.toISOString().slice(0, 10), 0);
  }
  for (const v of views30d) {
    const key = v.viewedAt.toISOString().slice(0, 10);
    if (dayCounts.has(key)) {
      dayCounts.set(key, dayCounts.get(key)! + 1);
    }
  }
  const viewsPerDay = Array.from(dayCounts, ([date, count]) => ({
    date,
    count,
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

  return NextResponse.json({
    totalViews: resume.viewCount,
    last7Days,
    last30Days,
    viewsPerDay,
    topReferrers,
    deviceBreakdown: { mobile, desktop },
  });
}
