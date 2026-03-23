import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadResume } from "@/lib/r2";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW = 3600; // 1 hour

export async function POST(request: NextRequest) {
  // Auth check
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Rate limiting
  const rateLimitKey = `upload:${userId}`;
  const uploadCount = await redis.incr(rateLimitKey);
  if (uploadCount === 1) {
    await redis.expire(rateLimitKey, RATE_LIMIT_WINDOW);
  }
  if (uploadCount > RATE_LIMIT_MAX) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Maximum 10 uploads per hour." },
      { status: 429 }
    );
  }

  // Parse form data
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const slug = formData.get("slug") as string | null;
  const displayName = formData.get("displayName") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!slug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  if (!displayName) {
    return NextResponse.json(
      { error: "Display name is required" },
      { status: 400 }
    );
  }

  // Validate file type
  if (
    file.type !== "application/pdf" &&
    !file.name.toLowerCase().endsWith(".pdf")
  ) {
    return NextResponse.json(
      { error: "Only PDF files are accepted" },
      { status: 400 }
    );
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File must be under 5MB" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Create new resume and mark it as primary, unset old primary
  const resume = await prisma.$transaction(async (tx) => {
    // Unset any existing primary resume for this slug
    await tx.resume.updateMany({
      where: { userId, slug, isPrimary: true },
      data: { isPrimary: false },
    });

    return tx.resume.create({
      data: {
        userId,
        slug,
        displayName,
        r2Key: "", // placeholder, will update after R2 upload
        fileSize: file.size,
        mimeType: file.type || "application/pdf",
        isPrimary: true,
      },
    });
  });

  const r2Key = await uploadResume(userId, resume.id, buffer, displayName);
  const updated = await prisma.resume.update({
    where: { id: resume.id },
    data: { r2Key },
  });

  return NextResponse.json({ resume: updated }, { status: 201 });
}
