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
  Upload,
  Pencil,
  FileText,
  Plus,
  Loader2,
  BarChart3,
  Monitor,
  Smartphone,
} from "lucide-react";
import { LazyPdfViewer } from "@/components/pdf-viewer-lazy";
import { getSlugAnalytics, type AnalyticsData } from "./actions";

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
  const [justUploadedId, setJustUploadedId] = useState<string | null>(null);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsFilter, setAnalyticsFilter] = useState<string | null>(null);

  async function handleOpenAnalytics(filterResumeId?: string) {
    setAnalyticsOpen(true);
    setAnalyticsLoading(true);
    setAnalyticsFilter(filterResumeId ?? null);
    const data = await getSlugAnalytics(filterResumeId);
    if (data) {
      setAnalyticsData(data);
    }
    setAnalyticsLoading(false);
  }

  async function handleFilterChange(filterResumeId: string | null) {
    setAnalyticsLoading(true);
    setAnalyticsFilter(filterResumeId);
    const data = await getSlugAnalytics(filterResumeId ?? undefined);
    if (data) {
      setAnalyticsData(data);
    }
    setAnalyticsLoading(false);
  }

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
        <div className="px-4 py-4 max-w-xl w-full">
          <DashboardHeader />
          <ShareLinkSection slug={slug} onAnalyticsClick={() => handleOpenAnalytics()} />
          <div className="flex flex-col items-center justify-center pt-20 gap-3">
            <FileText className="size-6 text-neutral-300" />
            <p className="text-sm text-neutral-500">
              No resumes yet
            </p>
            <Button size="sm" onClick={() => setUploadOpen(true)}>Upload resume</Button>
          </div>
        </div>

        <UploadDialog
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          slug={slug}
          onSuccess={(id) => {
            setUploadOpen(false);
            setJustUploadedId(id);
            fetchData();
          }}
        />

        <AnalyticsSheet
          open={analyticsOpen}
          onOpenChange={(open) => { setAnalyticsOpen(open); if (!open) setAnalyticsData(null); }}
          loading={analyticsLoading}
          data={analyticsData}
          filter={analyticsFilter}
          onFilterChange={handleFilterChange}
        />
      </div>
    );
  }

  return (
    <div className="w-full min-h-dvh flex flex-col items-center">
      <div className="px-4 py-4 max-w-xl w-full">
        <DashboardHeader />
        <ShareLinkSection slug={slug} onAnalyticsClick={() => handleOpenAnalytics()} />

        <div className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-neutral-500">Resumes</p>
            <Button size="sm" onClick={() => setUploadOpen(true)}>
              <Plus className="size-4 mr-1.5" />
              Upload
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            {resumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onUpdate={fetchData}
                isJustUploaded={resume.id === justUploadedId}
              />
            ))}
          </div>
        </div>
      </div>

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        slug={slug}
        onSuccess={(id) => {
          setUploadOpen(false);
          setJustUploadedId(id);
          fetchData();
        }}
      />

      <AnalyticsSheet
        open={analyticsOpen}
        onOpenChange={(open) => { setAnalyticsOpen(open); if (!open) setAnalyticsData(null); }}
        loading={analyticsLoading}
        data={analyticsData}
        filter={analyticsFilter}
        onFilterChange={handleFilterChange}
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
    <div className="w-full flex justify-between items-center">
      <Link href="/home" className="flex items-center gap-x-2">
        <div className="size-5 bg-violet-500 rounded-md" />
        <span className="text-sm font-semibold text-black">Rezume</span>
      </Link>
      <button
        onClick={handleSignOut}
        className="text-sm text-neutral-500 hover:text-black transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}

function ShareLinkSection({ slug, onAnalyticsClick }: { slug: string; onAnalyticsClick: () => void }) {
  const [copied, setCopied] = useState(false);
  const url = `https://rezume.so/${slug}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-6 flex items-center gap-2">
      <div className="flex-1 flex items-center h-9 rounded-lg border border-neutral-200 px-3 text-sm text-black truncate">
        rezume.so/{slug}
      </div>
      <button
        onClick={handleCopy}
        className="shrink-0 text-sm text-neutral-500 hover:text-black transition-colors"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <Link
        href={`/${slug}`}
        target="_blank"
        className="shrink-0 text-sm text-neutral-500 hover:text-black transition-colors"
      >
        Visit
      </Link>
      <button
        onClick={onAnalyticsClick}
        className="shrink-0 text-neutral-500 hover:text-black transition-colors"
      >
        <BarChart3 className="size-4" />
      </button>
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
  onSuccess: (resumeId: string) => void;
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

    const data = await res.json();
    reset();
    onSuccess(data.resume.id);
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
  isJustUploaded,
}: {
  resume: Resume;
  onUpdate: () => void;
  isJustUploaded?: boolean;
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
      className={`rounded-lg border p-4 transition-colors ${
        isJustUploaded
          ? "border-emerald-200 bg-emerald-50/30"
          : "border-neutral-200"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {editing ? (
            <>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-7 text-sm max-w-[200px]"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") {
                    setEditing(false);
                    setEditName(resume.displayName);
                  }
                }}
              />
              <button onClick={handleSaveName} className="text-xs text-violet-500 hover:text-violet-600">Save</button>
              <button onClick={() => { setEditing(false); setEditName(resume.displayName); }} className="text-xs text-neutral-400 hover:text-neutral-600">Cancel</button>
            </>
          ) : (
            <>
              <span className="text-sm font-medium text-black truncate">{resume.displayName}</span>
              {resume.isPrimary && (
                <span className="text-xs text-violet-500">primary</span>
              )}
              {isJustUploaded && (
                <span className="text-xs text-emerald-500">just uploaded</span>
              )}
              <button onClick={() => setEditing(true)} className="text-neutral-300 hover:text-neutral-500 transition-colors">
                <Pencil className="size-3" />
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-neutral-400 shrink-0">
          <span>{resume.viewCount} views</span>
          <span>
            {new Date(resume.updatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-neutral-100 text-xs">
        {!resume.isPrimary && (
          <button onClick={handleSetPrimary} className="text-neutral-500 hover:text-black transition-colors">
            Set as primary
          </button>
        )}

        {resume.isPrimary && (
          <button onClick={handleCopy} className="text-neutral-500 hover:text-black transition-colors">
            {copied ? "Copied" : "Copy link"}
          </button>
        )}

        <button onClick={handlePreview} className="text-neutral-500 hover:text-black transition-colors">
          Preview
        </button>

        <div className="flex-1" />

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogTrigger
            render={
              <button className="text-neutral-400 hover:text-red-500 transition-colors" />
            }
          >
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

const RESUME_COLORS = [
  "bg-violet-400",
  "bg-blue-400",
  "bg-emerald-400",
  "bg-amber-400",
  "bg-rose-400",
  "bg-cyan-400",
];

const RESUME_COLORS_HOVER = [
  "group-hover/bar:bg-violet-500",
  "group-hover/bar:bg-blue-500",
  "group-hover/bar:bg-emerald-500",
  "group-hover/bar:bg-amber-500",
  "group-hover/bar:bg-rose-500",
  "group-hover/bar:bg-cyan-500",
];

const RESUME_DOT_COLORS = [
  "bg-violet-400",
  "bg-blue-400",
  "bg-emerald-400",
  "bg-amber-400",
  "bg-rose-400",
  "bg-cyan-400",
];

function AnalyticsSheet({
  open,
  onOpenChange,
  loading,
  data,
  filter,
  onFilterChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  data: AnalyticsData | null;
  filter: string | null;
  onFilterChange: (resumeId: string | null) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="data-[side=right]:sm:max-w-md w-full flex flex-col">
        <SheetHeader>
          <SheetTitle>Analytics</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="size-6 animate-spin text-neutral-400" />
            </div>
          ) : data ? (
            <AnalyticsContent data={data} filter={filter} onFilterChange={onFilterChange} />
          ) : (
            <div className="flex items-center justify-center h-40 text-neutral-400">
              Failed to load analytics
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function AnalyticsContent({
  data,
  filter,
  onFilterChange,
}: {
  data: AnalyticsData;
  filter: string | null;
  onFilterChange: (resumeId: string | null) => void;
}) {
  const maxDayCount = Math.max(...data.viewsPerDay.map((d) => d.count), 1);

  // Build a stable color map for resumes
  const resumeColorIndex = new Map<string, number>();
  data.resumes.forEach((r, i) => {
    resumeColorIndex.set(r.id, i % RESUME_COLORS.length);
  });

  // Stable ordering for stacked segments
  const resumeOrder = data.resumes.map((r) => r.id);

  return (
    <div className="flex flex-col gap-6">
      {/* Filter */}
      {data.resumes.length > 1 && (
        <select
          value={filter ?? ""}
          onChange={(e) => onFilterChange(e.target.value || null)}
          className="w-full h-9 rounded-lg border border-neutral-200 px-3 text-sm text-black bg-white"
        >
          <option value="">All resumes</option>
          {data.resumes.map((r) => (
            <option key={r.id} value={r.id}>{r.displayName}</option>
          ))}
        </select>
      )}

      {/* Stat boxes */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-neutral-200 p-3 text-center">
          <p className="text-2xl font-semibold text-black">{data.totalViews}</p>
          <p className="text-xs text-neutral-500 mt-1">Total</p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-3 text-center">
          <p className="text-2xl font-semibold text-black">{data.last7Days}</p>
          <p className="text-xs text-neutral-500 mt-1">Last 7 days</p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-3 text-center">
          <p className="text-2xl font-semibold text-black">{data.last30Days}</p>
          <p className="text-xs text-neutral-500 mt-1">Last 30 days</p>
        </div>
      </div>

      {/* Bar chart */}
      <div>
        <p className="text-sm font-medium text-neutral-700 mb-3">Views per day</p>
        <div className="flex items-end gap-[2px] h-32">
          {data.viewsPerDay.map((d) => (
            <div
              key={d.date}
              className="flex-1 group/bar relative"
              style={{ height: "100%" }}
            >
              {/* Stacked segments */}
              <div className="absolute bottom-0 w-full flex flex-col-reverse">
                {d.count === 0 ? (
                  <div className="w-full h-[2px] rounded-sm bg-neutral-200" />
                ) : (
                  resumeOrder.map((resumeId) => {
                    const segment = d.byResume.find((b) => b.resumeId === resumeId);
                    if (!segment || segment.count === 0) return null;
                    const colorIdx = resumeColorIndex.get(resumeId) ?? 0;
                    const heightPct = (segment.count / maxDayCount) * 100;
                    return (
                      <div
                        key={resumeId}
                        className={`w-full first:rounded-b-sm last:rounded-t-sm ${RESUME_COLORS[colorIdx]} ${RESUME_COLORS_HOVER[colorIdx]} transition-colors`}
                        style={{ height: `${(heightPct / 100) * 128}px` }}
                      />
                    );
                  })
                )}
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover/bar:block bg-neutral-800 text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap pointer-events-none z-10">
                {d.date.slice(5)}: {d.count}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
          <span>{data.viewsPerDay[0]?.date.slice(5)}</span>
          <span>{data.viewsPerDay[data.viewsPerDay.length - 1]?.date.slice(5)}</span>
        </div>

        {/* Legend */}
        {!filter && data.resumes.length > 1 && (
          <div className="flex flex-wrap gap-3 mt-3">
            {data.resumes.map((r) => {
              const colorIdx = resumeColorIndex.get(r.id) ?? 0;
              return (
                <div key={r.id} className="flex items-center gap-1.5">
                  <div className={`size-2.5 rounded-sm ${RESUME_DOT_COLORS[colorIdx]}`} />
                  <span className="text-[11px] text-neutral-500 truncate max-w-[120px]">{r.displayName}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top referrers */}
      <div>
        <p className="text-sm font-medium text-neutral-700 mb-3">Top referrers</p>
        {data.topReferrers.length === 0 ? (
          <p className="text-xs text-neutral-400">No data yet</p>
        ) : (
          <div className="flex flex-col gap-2">
            {data.topReferrers.map((r) => (
              <div key={r.referrer} className="flex items-center justify-between text-sm">
                <span className="text-neutral-700 truncate mr-2">{r.referrer}</span>
                <span className="text-neutral-400 shrink-0">{r.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Device breakdown */}
      <div>
        <p className="text-sm font-medium text-neutral-700 mb-3">Devices (last 30 days)</p>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Monitor className="size-4 text-neutral-400" />
            <span className="text-sm text-neutral-700">{data.deviceBreakdown.desktop} desktop</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="size-4 text-neutral-400" />
            <span className="text-sm text-neutral-700">{data.deviceBreakdown.mobile} mobile</span>
          </div>
        </div>
      </div>
    </div>
  );
}
