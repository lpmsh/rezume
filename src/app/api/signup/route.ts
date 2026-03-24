import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { validateSlug } from "@/lib/slugs";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, password, slug: rawSlug } = body;

  if (!name || !email || !password || !rawSlug) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  // Validate slug first, before creating account
  const validation = validateSlug(rawSlug);
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.reason },
      { status: 400 }
    );
  }

  // Check if slug is taken
  const existingUser = await prisma.user.findUnique({
    where: { slug: validation.slug },
    select: { id: true },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "This slug is already taken" },
      { status: 409 }
    );
  }

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

  // Create account via better-auth's direct API — nextCookies() plugin
  // will set session cookies on the current response automatically
  let signUpResult;
  try {
    signUpResult = await auth.api.signUpEmail({
      body: { name, email, password },
      headers: request.headers,
    });
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Failed to create account";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const userId = signUpResult?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }

  // Claim slug immediately (server-side, no session needed)
  await prisma.user.update({
    where: { id: userId },
    data: { slug: validation.slug },
  });

  return NextResponse.json({ success: true });
}
