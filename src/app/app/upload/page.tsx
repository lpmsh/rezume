"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function UploadPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-neutral-400">Loading...</p>
        </div>
      }
    >
      <UploadPageInner />
    </Suspense>
  );
}

function UploadPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") ?? "";

  const [file, setFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // If no slug, redirect to dashboard
  useEffect(() => {
    if (!slug) {
      router.push("/app");
    }
  }, [slug, router]);

  if (!slug) {
    return null;
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile);
      if (!displayName) {
        setDisplayName(droppedFile.name.replace(/\.pdf$/i, ""));
      }
    } else {
      setError("Only PDF files are accepted");
    }
  };

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      if (!displayName) {
        setDisplayName(selected.name.replace(/\.pdf$/i, ""));
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !slug || !displayName) return;

    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("slug", slug);
    formData.append("displayName", displayName);

    const res = await fetch("/api/upload", { method: "POST", body: formData });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Upload failed");
      setUploading(false);
      return;
    }

    router.push("/app");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Upload your resume</CardTitle>
          <CardDescription>
            Your link will be rezume.so/{slug}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                dragActive
                  ? "border-violet-400 bg-violet-50"
                  : "border-neutral-200"
              }`}
            >
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-neutral-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm text-neutral-500">
                    Drag & drop your PDF here, or
                  </p>
                  <label>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <span className="inline-flex h-8 cursor-pointer items-center rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium hover:bg-neutral-50">
                      Browse files
                    </span>
                  </label>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                placeholder="e.g. John Doe Resume"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
              <p className="text-xs text-neutral-400">
                This is the filename when someone downloads your resume
              </p>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" disabled={!file || !displayName || uploading}>
              {uploading ? "Uploading..." : "Upload resume"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
