import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

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
    const tagline = resume?.user?.tagline;

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fafafa",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              position: "absolute",
              top: "48px",
              left: "64px",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                backgroundColor: "#8b5cf6",
                borderRadius: "6px",
                display: "flex",
              }}
            />
            <span
              style={{
                fontSize: "22px",
                fontWeight: 600,
                color: "#000",
              }}
            >
              Rezume
            </span>
          </div>

          <div
            style={{
              fontSize: "56px",
              fontWeight: 700,
              color: "#0a0a0a",
              textAlign: "center",
              maxWidth: "900px",
              lineHeight: 1.2,
              display: "flex",
            }}
          >
            {name}
          </div>

          {tagline ? (
            <div
              style={{
                fontSize: "26px",
                fontWeight: 400,
                color: "#737373",
                marginTop: "16px",
                textAlign: "center",
                maxWidth: "800px",
                display: "flex",
              }}
            >
              {tagline}
            </div>
          ) : null}

          <div
            style={{
              position: "absolute",
              bottom: "48px",
              fontSize: "18px",
              color: "#a3a3a3",
              display: "flex",
            }}
          >
            rezume.so/{slug}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error("OG image generation failed:", e);
    return new Response(`OG image error: ${e}`, { status: 500 });
  }
}
