"use client";

import dynamic from "next/dynamic";

const ResumeViewer = dynamic(
  () => import("./resume-viewer").then((m) => m.ResumeViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 items-center justify-center bg-neutral-100">
        <div className="size-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" />
      </div>
    ),
  }
);

export { ResumeViewer };
