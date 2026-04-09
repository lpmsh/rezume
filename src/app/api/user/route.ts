import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, slug: true, tagline: true },
  });

  return NextResponse.json({ user });
}

export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { tagline } = body;

  if (typeof tagline !== "string" && tagline !== null) {
    return NextResponse.json(
      { error: "tagline must be a string or null" },
      { status: 400 }
    );
  }

  const trimmed = typeof tagline === "string" ? tagline.trim() : null;

  if (trimmed && trimmed.length > 120) {
    return NextResponse.json(
      { error: "Tagline must be 120 characters or less" },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { tagline: trimmed || null },
    select: { id: true, name: true, email: true, slug: true, tagline: true },
  });

  return NextResponse.json({ user });
}
