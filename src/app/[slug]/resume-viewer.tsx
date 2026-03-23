"use client";

import { Button } from "@/components/ui/button";

export function ResumeViewer({
  pdfUrl,
  displayName,
  resumeId,
}: {
  pdfUrl: string;
  displayName: string;
  resumeId: string;
}) {
  async function handleDownload() {
    const res = await fetch(`/api/resumes/${resumeId}/download`);
    if (!res.ok) return;
    const data = await res.json();

    const link = document.createElement("a");
    link.href = data.url;
    link.download = data.filename;
    link.click();
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h1 className="text-sm font-medium">{displayName}</h1>
        <Button size="sm" variant="outline" onClick={handleDownload}>
          Download
        </Button>
      </div>
      <iframe
        src={pdfUrl}
        className="h-[calc(100vh-8rem)] w-full"
        title={`${displayName} resume`}
      />
    </div>
  );
}
