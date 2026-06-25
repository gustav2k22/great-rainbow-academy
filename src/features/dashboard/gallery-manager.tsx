"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, Play, Save } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/dashboard/modal";
import { MediaPicker } from "@/components/dashboard/media-picker";
import { Label, Select, Input } from "@/components/ui/field";
import { Panel, EmptyState } from "@/components/dashboard/ui";
import { saveRecord, deleteRecord } from "./crud-actions";

interface Item { id: string; media_id: string; caption: string | null; sort_order: number; media?: { public_url: string; kind: string } | null }
interface Album { id: string; title: string; slug: string; items: Item[] }

export function GalleryManager({ albums }: { albums: Album[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [albumId, setAlbumId] = useState(albums[0]?.id ?? "");

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const media_id = fd.get("media_id") as string;
    if (!media_id) return toast.error("Please choose an image or video.");
    startTransition(async () => {
      const res = await saveRecord("gallery_items", null, {
        album_id: fd.get("album_id"),
        media_id,
        caption: fd.get("caption") || null,
        sort_order: Number(fd.get("sort_order") || 0),
      }, "/dashboard/gallery");
      if (res.ok) {
        toast.success("Added to gallery");
        setAdding(false);
        router.refresh();
      } else toast.error(res.message ?? "Could not add");
    });
  }

  function onRemove(item: Item) {
    if (!confirm("Remove this item from the gallery?")) return;
    startTransition(async () => {
      const res = await deleteRecord("gallery_items", item.id, "/dashboard/gallery");
      if (res.ok) {
        toast.success("Removed");
        router.refresh();
      } else toast.error(res.message ?? "Could not remove");
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setAdding(true)} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700">
          <Plus className="h-4 w-4" /> Add Media to Gallery
        </button>
      </div>

      {albums.map((album) => (
        <Panel key={album.id}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">{album.title}</h2>
            <span className="text-sm text-muted">{album.items.length} items</span>
          </div>
          {album.items.length === 0 ? (
            <EmptyState title="No media in this album" description="Use the button above to add images or videos." icon={<Plus className="h-6 w-6" />} />
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
              {album.items.map((it) => (
                <div key={it.id} className="group relative aspect-square overflow-hidden rounded-xl border border-brand-100">
                  {it.media?.kind === "video" ? (
                    <span className="grid h-full w-full place-items-center bg-brand-900 text-white"><Play className="h-6 w-6" /></span>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.media?.public_url} alt={it.caption ?? ""} className="h-full w-full object-cover" loading="lazy" />
                  )}
                  <button onClick={() => onRemove(it)} className="absolute right-1 top-1 rounded-full bg-white/90 p-1.5 text-red-600 opacity-0 transition hover:bg-white group-hover:opacity-100" aria-label="Remove">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Panel>
      ))}

      <Modal open={adding} onClose={() => setAdding(false)} title="Add Media to Gallery" size="md">
        <form onSubmit={onAdd} className="space-y-4">
          <div>
            <Label htmlFor="album_id" required>Album</Label>
            <Select id="album_id" name="album_id" value={albumId} onChange={(e) => setAlbumId(e.target.value)}>
              {albums.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
            </Select>
          </div>
          <div>
            <Label>Media</Label>
            <MediaPicker name="media_id" folder="gallery" label="Media" />
          </div>
          <div>
            <Label htmlFor="caption">Caption (optional)</Label>
            <Input id="caption" name="caption" />
          </div>
          <input type="hidden" name="sort_order" value={0} />
          <div className="flex justify-end gap-2 border-t border-brand-100 pt-4">
            <button type="button" onClick={() => setAdding(false)} className="h-11 rounded-full px-5 text-sm font-semibold text-muted hover:bg-brand-50">Cancel</button>
            <button type="submit" disabled={pending} className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-600 px-6 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-70">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Add
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
