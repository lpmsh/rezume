import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getResume } from "@/lib/r2";
import { trackView } from "@/lib/view-counter";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ResumeViewer } from "./resume-viewer-loader";

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
      <div className="fixed right-4 bottom-4 z-10 rounded-full bg-white/90 px-3 py-1.5 text-xs text-muted-foreground shadow-sm ring-1 ring-black/5 backdrop-blur-sm">
        Powered by{" "}
        <a href="/" className="font-medium text-foreground/70 underline underline-offset-2 hover:text-foreground">
          rezume.so
        </a>
      </div>
    </div>
  );
}
