"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function QrCodeModal({
  open,
  onOpenChange,
  url,
  slug,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  slug: string;
}) {
  const [pngDataUrl, setPngDataUrl] = useState<string | null>(null);
  const [svgString, setSvgString] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function generate() {
      const [png, svg] = await Promise.all([
        QRCode.toDataURL(url, {
          width: 1024,
          margin: 2,
          errorCorrectionLevel: "H",
          color: { dark: "#000000", light: "#00000000" },
        }),
        QRCode.toString(url, { type: "svg", margin: 2, errorCorrectionLevel: "H" }),
      ]);

      if (!cancelled) {
        setPngDataUrl(png);
        setSvgString(svg);
      }
    }

    generate();

    return () => {
      cancelled = true;
    };
  }, [open, url]);

  function handleDownloadSvg() {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `rezume-qr-${slug}.svg`;
    a.click();
    URL.revokeObjectURL(blobUrl);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
          <DialogDescription>
            Scan to open your rezume.so page. Download for business cards, slide
            decks, or career fairs.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center py-2">
          {pngDataUrl ? (
            <img // eslint-disable-line @next/next/no-img-element -- data URL, not a remote image
              src={pngDataUrl}
              alt="QR code"
              className="w-48 h-48"
            />
          ) : (
            <div className="w-48 h-48 rounded-lg bg-neutral-100 animate-pulse" />
          )}
        </div>

        <DialogFooter>
          <a
            href={pngDataUrl ?? undefined}
            download={`rezume-qr-${slug}.png`}
            className={!pngDataUrl ? "pointer-events-none opacity-50" : ""}
          >
            <Button variant="outline" disabled={!pngDataUrl}>
              <Download className="size-4 mr-1.5" />
              PNG
            </Button>
          </a>
          <Button
            variant="outline"
            disabled={!svgString}
            onClick={handleDownloadSvg}
          >
            <Download className="size-4 mr-1.5" />
            SVG
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
