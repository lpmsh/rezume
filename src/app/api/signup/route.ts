import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

  // Create account via better-auth's own endpoint so cookies are set properly
  const signUpRes = await fetch(
    new URL("/api/auth/sign-up/email", request.url),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: request.headers.get("cookie") ?? "",
        origin: request.headers.get("origin") ?? new URL(request.url).origin,
      },
      body: JSON.stringify({ name, email, password }),
    }
  );

  if (!signUpRes.ok) {
    let message = "Failed to create account";
    try {
      const data = await signUpRes.json();
      message = data.message ?? data.error ?? message;
    } catch {
      // empty
    }
    return NextResponse.json({ error: message }, { status: signUpRes.status });
  }

  const signUpData = await signUpRes.json();
  const userId = signUpData.user?.id;

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

  // Forward the Set-Cookie headers from better-auth's response
  const response = NextResponse.json({ success: true });
  const setCookie = signUpRes.headers.getSetCookie();
  for (const cookie of setCookie) {
    response.headers.append("Set-Cookie", cookie);
  }

  return response;
}
