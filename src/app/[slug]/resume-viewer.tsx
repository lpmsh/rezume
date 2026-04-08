"use client";

import { Download } from "lucide-react";
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
      <header className="flex items-center justify-between px-4 py-2">
        <span className="text-sm text-neutral-500">{displayName}</span>
        <button
          onClick={handleDownload}
          className="text-neutral-400 hover:text-black transition-colors"
        >
          <Download className="size-4" />
        </button>
      </header>
      <PdfViewer file={pdfUrl} />
    </div>
  );
}
