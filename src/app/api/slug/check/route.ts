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

  const existing = await prisma.resume.findFirst({
    where: { slug: validation.slug, namedSlug: null },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json({
      available: false,
      reason: "This slug is taken",
    });
  }

  return NextResponse.json({ available: true });
}
