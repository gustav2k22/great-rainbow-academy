"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Play, Trash2, Upload, Pencil, Save } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/dashboard/modal";
import { Input, Label } from "@/components/ui/field";
import { EmptyState } from "@/components/dashboard/ui";
import { deleteMedia, updateMediaMeta, uploadMedia } from "./actions";

interface MediaItem {
  id: string;
  public_url: string;
  kind: string;
  title: string | null;
  alt: string | null;
  caption: string | null;
  folder: string | null;
  width: number | null;
  height: number | null;
}

export function MediaLibrary({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<MediaItem | null>(null);

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    startTransition(async () => {
      for (const file of files) {
        const fd = new FormData();
        fd.set("file", file);
        fd.set("folder", "general");
        const res = await uploadMedia(fd);
        if (!res.ok) toast.error(`${file.name}: ${res.message}`);
      }
      toast.success("Upload complete");
      router.refresh();
    });
    e.target.value = "";
  }

  function onDelete(item: MediaItem) {
    if (!confirm("Delete this media file permanently?")) return;
    startTransition(async () => {
      const res = await deleteMedia(item.id);
      if (res.ok) {
        toast.success("Deleted");
        router.refresh();
      } else toast.error(res.message ?? "Could not delete");
    });
  }

  function onSaveMeta(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    startTransition(async () => {
      const res = await updateMediaMeta(editing!.id, {
        title: fd.get("title") as string,
        alt: fd.get("alt") as string,
        caption: fd.get("caption") as string,
      });
      if (res.ok) {
        toast.success("Saved");
        setEditing(null);
        router.refresh();
      } else toast.error(res.message ?? "Could not save");
    });
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{items.length} files in your library</p>
        <label className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full bg-brand-600 px-5 text-sm font-bold text-white transition hover:bg-brand-700">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload
          <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={onUpload} disabled={pending} />
        </label>
      </div>

      {items.length === 0 ? (
        <EmptyState title="No media yet" description="Upload images and videos to use across your website." icon={<Upload className="h-6 w-6" />} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((m) => (
            <div key={m.id} className="group relative overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm">
              <div className="relative aspect-square bg-brand-50">
                {m.kind === "video" ? (
                  <span className="grid h-full w-full place-items-center bg-brand-900 text-white"><Play className="h-7 w-7" /></span>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.public_url} alt={m.alt ?? ""} className="h-full w-full object-cover" loading="lazy" />
                )}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition group-hover:opacity-100">
                  <button onClick={() => setEditing(m)} className="rounded-full bg-white p-2 text-brand-700 hover:bg-brand-50" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => onDelete(m)} className="rounded-full bg-white p-2 text-red-600 hover:bg-red-50" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="p-2.5">
                <p className="truncate text-xs font-semibold text-ink">{m.title || m.alt || "Untitled"}</p>
                <p className="text-[10px] text-muted">{m.folder} · {m.width && m.height ? `${m.width}×${m.height}` : m.kind}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit media details">
        {editing && (
          <form onSubmit={onSaveMeta} className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-brand-100">
              {editing.kind === "video" ? (
                <video src={editing.public_url} controls className="max-h-56 w-full bg-black" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={editing.public_url} alt="" className="max-h-56 w-full object-contain" />
              )}
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={editing.title ?? ""} />
            </div>
            <div>
              <Label htmlFor="alt">Alt text (for accessibility & SEO)</Label>
              <Input id="alt" name="alt" defaultValue={editing.alt ?? ""} />
            </div>
            <div>
              <Label htmlFor="caption">Caption</Label>
              <Input id="caption" name="caption" defaultValue={editing.caption ?? ""} />
            </div>
            <div className="flex justify-end gap-2 border-t border-brand-100 pt-4">
              <button type="button" onClick={() => setEditing(null)} className="h-11 rounded-full px-5 text-sm font-semibold text-muted hover:bg-brand-50">Cancel</button>
              <button type="submit" disabled={pending} className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-600 px-6 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-70">
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
