"use client";

import dynamic from "next/dynamic";

export const LazyPdfViewer = dynamic(
  () => import("./pdf-viewer").then((m) => m.PdfViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" />
      </div>
    ),
  }
);
