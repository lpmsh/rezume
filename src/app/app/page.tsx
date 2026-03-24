"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Copy,
  Check,
  Upload,
  Trash2,
  ExternalLink,
  Eye,
  Pencil,
  FileText,
  Star,
  Plus,
  Loader2,
} from "lucide-react";
import { LazyPdfViewer } from "@/components/pdf-viewer-lazy";

type Resume = {
  id: string;
  displayName: string;
  slug: string;
  namedSlug: string | null;
  fileSize: number;
  isPublic: boolean;
  isPrimary: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  slug: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);

  const fetchData = useCallback(async () => {
    const [userRes, resumesRes] = await Promise.all([
      fetch("/api/user"),
      fetch("/api/resumes"),
    ]);

    if (userRes.ok) {
      const userData = await userRes.json();
      setUser(userData.user);

      // If user has no slug, redirect to setup
      if (!userData.user?.slug) {
        router.push("/app/setup");
        return;
      }
    }

    if (resumesRes.ok) {
      const data = await resumesRes.json();
      setResumes(data.resumes);
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading || !user?.slug) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-neutral-400">Loading...</p>
      </div>
    );
  }

  const slug = user.slug;

  if (resumes.length === 0) {
    return (
      <div className="w-full min-h-dvh flex flex-col items-center">
        <div className="px-4 py-4 max-w-4xl w-full">
          <DashboardHeader />
          <ShareLinkSection slug={slug} />
          <div className="flex flex-col items-center justify-center pt-24 gap-4">
            <div className="size-16 rounded-2xl bg-neutral-100 flex items-center justify-center">
              <FileText className="size-8 text-neutral-400" />
            </div>
            <h2 className="text-xl text-black font-heading">
              No resumes yet
            </h2>
            <p className="text-neutral-500 text-sm">
              Upload your first resume to get started
            </p>
            <Button onClick={() => setUploadOpen(true)}>Upload resume</Button>
          </div>
        </div>

        <UploadDialog
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          slug={slug}
          onSuccess={() => {
            setUploadOpen(false);
            fetchData();
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full min-h-dvh flex flex-col items-center">
      <div className="px-4 py-4 max-w-4xl w-full">
        <DashboardHeader />
        <ShareLinkSection slug={slug} />

        <div className="pt-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-heading text-3xl text-black">Your Resumes</h1>
            <Button size="sm" onClick={() => setUploadOpen(true)}>
              <Plus className="size-4 mr-1.5" />
              Upload new
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {resumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onUpdate={fetchData}
              />
            ))}
          </div>
        </div>
      </div>

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        slug={slug}
        onSuccess={() => {
          setUploadOpen(false);
          fetchData();
        }}
      />
    </div>
  );
}

function DashboardHeader() {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
  }

  return (
    <div className="w-full flex justify-between items-center h-fit">
      <Link href="/home" className="flex items-center gap-x-3">
        <div className="size-6 bg-violet-500 rounded-md" />
        <h3 className="text-xl font-semibold text-black">Rezume</h3>
      </Link>
      <div className="flex items-center gap-x-2">
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    </div>
  );
}

function ShareLinkSection({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const url = `https://rezume.so/${slug}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-5">
      <p className="text-sm font-medium text-neutral-500 mb-2">Your public link</p>
      <div className="flex items-center gap-2">
        <div className="flex-1 rounded-lg bg-neutral-50 border border-neutral-200 px-3 py-2 text-sm text-black font-medium truncate">
          rezume.so/{slug}
        </div>
        <Button size="sm" variant="outline" onClick={handleCopy}>
          {copied ? (
            <Check className="size-4 mr-1.5 text-emerald-500" />
          ) : (
            <Copy className="size-4 mr-1.5" />
          )}
          {copied ? "Copied!" : "Copy"}
        </Button>
        <Link href={`/${slug}`} target="_blank">
          <Button size="sm" variant="outline">
            <ExternalLink className="size-4 mr-1.5" />
            Visit
          </Button>
        </Link>
      </div>
    </div>
  );
}

function UploadDialog({
  open,
  onOpenChange,
  slug,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
  onSuccess: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setFile(null);
    setDisplayName("");
    setDragActive(false);
    setUploading(false);
    setError("");
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
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
  }

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
    if (!file || !displayName) return;

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

    reset();
    onSuccess();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload a new resume</DialogTitle>
          <DialogDescription>
            This will be added to rezume.so/{slug}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              dragActive ? "border-violet-400 bg-violet-50" : "border-neutral-200"
            }`}
          >
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-neutral-400">
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
                <Upload className="size-6 text-neutral-300 mb-1" />
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
            <Label htmlFor="uploadDisplayName">Display name</Label>
            <Input
              id="uploadDisplayName"
              placeholder="e.g. John Doe Resume 2026"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <DialogFooter>
            <Button
              type="submit"
              disabled={!file || !displayName || uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ResumeCard({
  resume,
  onUpdate,
}: {
  resume: Resume;
  onUpdate: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(resume.displayName);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const publicUrl = `rezume.so/${resume.slug}${resume.namedSlug ? `/${resume.namedSlug}` : ""}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(`https://${publicUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handlePreview() {
    setPreviewOpen(true);
    setPreviewLoading(true);
    const res = await fetch(`/api/resumes/${resume.id}/preview`);
    if (res.ok) {
      const blob = await res.blob();
      const dataUrl = URL.createObjectURL(blob);
      setPreviewUrl(dataUrl);
    }
    setPreviewLoading(false);
  }

  async function handleSaveName() {
    const res = await fetch(`/api/resumes/${resume.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: editName }),
    });
    if (res.ok) {
      setEditing(false);
      onUpdate();
    }
  }

  async function handleSetPrimary() {
    await fetch(`/api/resumes/${resume.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPrimary: true }),
    });
    onUpdate();
  }


  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/resumes/${resume.id}`, { method: "DELETE" });
    setDeleteDialogOpen(false);
    setDeleting(false);
    onUpdate();
  }

  return (
    <div
      className={`rounded-xl border bg-white p-5 transition-colors hover:border-neutral-300 ${
        resume.isPrimary ? "border-violet-200 bg-violet-50/30" : "border-neutral-200"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex items-center gap-2 mb-1">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-8 text-sm max-w-[260px]"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") {
                    setEditing(false);
                    setEditName(resume.displayName);
                  }
                }}
              />
              <Button size="sm" onClick={handleSaveName}>
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditing(false);
                  setEditName(resume.displayName);
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-black truncate">
                {resume.displayName}
              </h3>
              {resume.isPrimary && (
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-600">
                  <Star className="size-3" />
                  Primary
                </span>
              )}
              <button
                onClick={() => setEditing(true)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <Pencil className="size-3.5" />
              </button>
            </div>
          )}
          <p className="text-sm text-neutral-400">
            {(resume.fileSize / 1024).toFixed(0)} KB
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-neutral-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <Eye className="size-4 text-neutral-400" />
            <span>{resume.viewCount}</span>
          </div>
          <span className="text-neutral-300">·</span>
          <span>
            {new Date(resume.updatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-neutral-100">
        {!resume.isPrimary && (
          <Button size="sm" variant="ghost" onClick={handleSetPrimary}>
            <Star className="size-4 mr-1.5" />
            Set as primary
          </Button>
        )}

        <Button size="sm" variant="ghost" onClick={handleCopy}>
          {copied ? (
            <Check className="size-4 mr-1.5 text-emerald-500" />
          ) : (
            <Copy className="size-4 mr-1.5" />
          )}
          {copied ? "Copied!" : "Copy link"}
        </Button>

        <Button size="sm" variant="ghost" onClick={handlePreview}>
          <Eye className="size-4 mr-1.5" />
          Preview
        </Button>

        <div className="flex-1" />

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogTrigger
            render={
              <Button
                size="sm"
                variant="ghost"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              />
            }
          >
            <Trash2 className="size-4 mr-1.5" />
            Delete
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete resume?</DialogTitle>
              <DialogDescription>
                This will permanently delete &quot;{resume.displayName}&quot;.
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Sheet
        open={previewOpen}
        onOpenChange={(open) => {
          setPreviewOpen(open);
          if (!open) {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
          }
        }}
      >
        <SheetContent side="right" className="data-[side=right]:sm:max-w-3xl w-full flex flex-col">
          <SheetHeader>
            <SheetTitle>{resume.displayName}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">
            {previewLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="size-6 animate-spin text-neutral-400" />
              </div>
            ) : previewUrl ? (
              <LazyPdfViewer
                file={previewUrl}
                className="h-full overflow-y-auto bg-neutral-100 px-4 py-4"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-400">
                Failed to load preview
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
