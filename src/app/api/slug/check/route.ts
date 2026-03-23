import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateSlug } from "@/lib/slugs";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");

  if (!slug) {
    return NextResponse.json(
      { available: false, reason: "Slug is required" },
      { status: 400 }
    );
  }

  const validation = validateSlug(slug);
  if (!validation.valid) {
    return NextResponse.json({
      available: false,
      reason: validation.reason,
    });
  }

  const [existingUser, existingResume] = await Promise.all([
    prisma.user.findUnique({
      where: { slug: validation.slug },
      select: { id: true },
    }),
    prisma.resume.findFirst({
      where: { slug: validation.slug, namedSlug: null },
      select: { id: true },
    }),
  ]);

  if (existingUser || existingResume) {
    return NextResponse.json({
      available: false,
      reason: "This slug is taken",
    });
  }

  return NextResponse.json({ available: true });
}
