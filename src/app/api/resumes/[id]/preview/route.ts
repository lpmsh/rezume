import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getResume } from "@/lib/r2";
import { auth } from "@/lib/auth";

export async function GET(
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

  const resume = await prisma.resume.findUnique({
    where: { id, userId: session.user.id },
    select: { r2Key: true, displayName: true },
  });

  if (!resume) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { body } = await getResume(resume.r2Key);
  const bytes = await body!.transformToByteArray();

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${resume.displayName}.pdf"`,
    },
  });
}
