import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getResume } from "@/lib/r2";
import { trackView } from "@/lib/view-counter";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ResumeViewer } from "./resume-viewer-loader";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { MadeWithRezume } from "@/components/made-with-rezume";
import { showsAttribution } from "@/lib/plan";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resume = await prisma.resume.findFirst({
    where: { slug, namedSlug: null, isPublic: true, isPrimary: true },
    select: {
      displayName: true,
      user: { select: { name: true, tagline: true } },
    },
  });

  const name = resume?.user?.name ?? resume?.displayName ?? "Resume";
  const description = resume?.user?.tagline ?? `${name}'s resume on Rezume`;

  return buildMetadata({
    title: name,
    absoluteTitle: true,
    description,
    canonical: `/${slug}`,
    // Resume-specific OG card rendered by the per-slug endpoint.
    image: `/api/og/${slug}`,
    ogType: "profile",
    // Hosted resumes are private to each user, so keep them out of search.
    noindex: true,
  });
}

export default async function PublicResumePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const resume = await prisma.resume.findFirst({
    where: { slug, namedSlug: null, isPublic: true, isPrimary: true },
    include: { user: { select: { id: true, plan: true } } },
  });

  if (!resume) {
    notFound();
  }

  const { body } = await getResume(resume.r2Key);
  const pdfBytes = await body!.transformToByteArray();
  const pdfDataUrl = `data:application/pdf;base64,${Buffer.from(pdfBytes).toString("base64")}`;

  // Track view (non-blocking)
  const reqHeaders = await headers();
  const session = await auth.api
    .getSession({ headers: reqHeaders })
    .catch(() => null);

  const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const userAgent = reqHeaders.get("user-agent") ?? "";
  const referrer = reqHeaders.get("referer") ?? "";
  const host = reqHeaders.get("host") ?? "rezume.so";

  trackView({
    resumeId: resume.id,
    ownerId: resume.user.id,
    viewerUserId: session?.user?.id,
    ip,
    userAgent,
    referrer,
    host,
  });

  return (
    <div className="h-screen">
      <ResumeViewer
        pdfUrl={pdfDataUrl}
        displayName={resume.displayName}
        resumeId={resume.id}
      />
      {showsAttribution(resume.user.plan) && <MadeWithRezume />}
    </div>
  );
}
