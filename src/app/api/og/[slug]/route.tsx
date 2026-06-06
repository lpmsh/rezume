import { prisma } from "@/lib/prisma";
import { ogImageResponse } from "@/lib/seo/og";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const resume = await prisma.resume.findFirst({
      where: { slug, namedSlug: null, isPublic: true, isPrimary: true },
      select: {
        displayName: true,
        user: { select: { name: true, tagline: true } },
      },
    });

    const name = resume?.user?.name ?? resume?.displayName ?? "Resume";
    const tagline = resume?.user?.tagline ?? undefined;

    return ogImageResponse({
      title: name,
      subtitle: tagline,
      footer: `rezume.so/${slug}`,
    });
  } catch (e) {
    console.error("OG image generation failed:", e);
    return new Response(`OG image error: ${e}`, { status: 500 });
  }
}
