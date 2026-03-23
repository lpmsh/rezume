import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getResumeUrl } from "@/lib/r2";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const resume = await prisma.resume.findUnique({
    where: { id },
    select: { r2Key: true, displayName: true, isPublic: true },
  });

  if (!resume || !resume.isPublic) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = await getResumeUrl(resume.r2Key);

  return NextResponse.json({
    url,
    filename: `${resume.displayName}.pdf`,
  });
}
