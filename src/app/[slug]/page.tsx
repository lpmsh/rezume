import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getResume } from "@/lib/r2";
import { trackView } from "@/lib/view-counter";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ResumeViewer } from "./resume-viewer-loader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function PublicResumePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const resume = await prisma.resume.findFirst({
    where: { slug, namedSlug: null, isPublic: true, isPrimary: true },
    include: { user: { select: { id: true } } },
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

  trackView({
    resumeId: resume.id,
    ownerId: resume.user.id,
    viewerUserId: session?.user?.id,
    ip,
    userAgent,
  });

  return (
    <div className="h-screen">
      <ResumeViewer
        pdfUrl={pdfDataUrl}
        displayName={resume.displayName}
        resumeId={resume.id}
      />
      <div className="fixed right-4 bottom-4 z-10 text-xs text-neutral-400">
        <a href="/" className="hover:text-neutral-600 transition-colors">
          rezume.so
        </a>
      </div>
    </div>
  );
}
