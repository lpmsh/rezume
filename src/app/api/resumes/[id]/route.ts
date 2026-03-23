import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteResume } from "@/lib/r2";
import { auth } from "@/lib/auth";

export async function PATCH(
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

  const body = await request.json();
  const { displayName, isPrimary } = body;

  const data: Record<string, unknown> = {};

  if (displayName && typeof displayName === "string") {
    data.displayName = displayName.trim();
  }

  if (isPrimary === true) {
    // Unset primary on all other resumes with the same slug
    await prisma.resume.updateMany({
      where: { userId: session.user.id, slug: resume.slug, id: { not: id } },
      data: { isPrimary: false },
    });
    data.isPrimary = true;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  const updated = await prisma.resume.update({
    where: { id },
    data,
  });

  return NextResponse.json({ resume: updated });
}

export async function DELETE(
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

  // Delete R2 object
  await deleteResume(resume.r2Key);

  // Delete resume (cascade handles views via schema)
  await prisma.resume.delete({ where: { id } });

  // If deleted resume was primary, promote the most recent remaining one
  if (resume.isPrimary) {
    const next = await prisma.resume.findFirst({
      where: { userId: session.user.id, slug: resume.slug },
      orderBy: { createdAt: "desc" },
    });
    if (next) {
      await prisma.resume.update({
        where: { id: next.id },
        data: { isPrimary: true },
      });
    }
  }

  return NextResponse.json({ success: true });
}
