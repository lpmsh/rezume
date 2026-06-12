import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getResume } from "@/lib/r2";

/**
 * Public, CDN-cacheable PDF endpoint for a hosted resume.
 *
 * The page links here with a `?v=<updatedAt>` cache buster, so responses can be
 * cached aggressively at the edge — a re-upload changes `updatedAt`, which
 * changes the URL and naturally busts the cache.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const resume = await prisma.resume.findFirst({
    where: { slug, namedSlug: null, isPublic: true, isPrimary: true },
    select: { r2Key: true, displayName: true },
  });

  if (!resume) {
    return new NextResponse("Not found", { status: 404 });
  }

  const { body, contentLength } = await getResume(resume.r2Key);
  const bytes = await body!.transformToByteArray();

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${resume.displayName}.pdf"`,
      ...(contentLength
        ? { "Content-Length": String(contentLength) }
        : {}),
      // URL is versioned by updatedAt, so the bytes for a given URL never
      // change — cache hard at the browser and the Vercel CDN.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
