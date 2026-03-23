import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { validateSlug } from "@/lib/slugs";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // If user already has a slug, reject
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { slug: true },
  });

  if (user?.slug) {
    return NextResponse.json(
      { error: "You already have a slug" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { slug: rawSlug } = body;

  if (!rawSlug || typeof rawSlug !== "string") {
    return NextResponse.json(
      { error: "Slug is required" },
      { status: 400 }
    );
  }

  const validation = validateSlug(rawSlug);
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.reason },
      { status: 400 }
    );
  }

  // Check if slug is taken by another user
  const existing = await prisma.user.findUnique({
    where: { slug: validation.slug },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json(
      { error: "This slug is already taken" },
      { status: 409 }
    );
  }

  // Also check if any resume already uses this slug (legacy data)
  const existingResume = await prisma.resume.findFirst({
    where: { slug: validation.slug, namedSlug: null },
    select: { id: true },
  });

  if (existingResume) {
    return NextResponse.json(
      { error: "This slug is already taken" },
      { status: 409 }
    );
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { slug: validation.slug },
  });

  return NextResponse.json({ slug: validation.slug });
}
