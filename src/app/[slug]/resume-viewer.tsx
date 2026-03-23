"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PdfViewer } from "@/components/pdf-viewer";

export function ResumeViewer({
  pdfUrl,
  displayName,
}: {
  pdfUrl: string;
  displayName: string;
  resumeId: string;
}) {
  function handleDownload() {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `${displayName}.pdf`;
    link.click();
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between px-5 py-2.5">
        <h1 className="text-sm font-medium text-foreground">{displayName}</h1>
        <Button size="sm" variant="ghost" onClick={handleDownload}>
          <Download className="size-3.5" />
          Download
        </Button>
      </header>
      <PdfViewer file={pdfUrl} />
    </div>
  );
}
