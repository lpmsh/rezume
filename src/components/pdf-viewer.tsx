"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function PdfViewer({
  file,
  maxWidth = 900,
  className,
}: {
  file: string;
  maxWidth?: number;
  className?: string;
}) {
  const [numPages, setNumPages] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageWidth, setPageWidth] = useState<number>(800);

  const updateWidth = useCallback(() => {
    if (!containerRef.current) return;
    const available = containerRef.current.clientWidth - 32;
    setPageWidth(Math.min(available, maxWidth));
  }, [maxWidth]);

  useEffect(() => {
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [updateWidth]);

  return (
    <div
      ref={containerRef}
      className={className ?? "flex-1 overflow-y-auto bg-neutral-100 px-4 py-4"}
    >
      <Document
        file={file}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading={
          <div className="flex h-full min-h-[60vh] items-center justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" />
          </div>
        }
        className="flex flex-col items-center gap-4"
      >
        {Array.from({ length: numPages }, (_, i) => (
          <Page
            key={i + 1}
            pageNumber={i + 1}
            width={pageWidth}
            className="shadow-di overflow-hidden rounded-lg"
            loading={
              <div
                className="animate-pulse rounded-lg bg-white"
                style={{
                  width: pageWidth,
                  height: pageWidth * 1.294,
                }}
              />
            }
          />
        ))}
      </Document>
    </div>
  );
}
