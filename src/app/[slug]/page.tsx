import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getResumeUrl } from "@/lib/r2";
import { trackView } from "@/lib/view-counter";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ResumeViewer } from "./resume-viewer";

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

  const pdfUrl = await getResumeUrl(resume.r2Key);

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
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <ResumeViewer
          pdfUrl={pdfUrl}
          displayName={resume.displayName}
          resumeId={resume.id}
        />
      </div>
      <footer className="border-t py-3 text-center text-xs text-muted-foreground">
        Powered by{" "}
        <a href="/" className="text-primary underline underline-offset-2">
          rezume.so
        </a>
      </footer>
    </div>
  );
}
