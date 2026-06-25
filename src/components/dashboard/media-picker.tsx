"use client";

import { useEffect, useState, useTransition } from "react";
import { ImagePlus, Loader2, Trash2, Upload, Check, Play } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "./modal";
import { listMedia, uploadMedia } from "@/features/media/actions";

interface MediaLite {
  id: string;
  public_url: string;
  kind: string;
  alt: string | null;
  title: string | null;
}

export function MediaPicker({
  name,
  defaultValue,
  defaultPreview,
  folder = "general",
  label = "Image",
}: {
  name: string;
  defaultValue?: string | null;
  defaultPreview?: string | null;
  folder?: string;
  label?: string;
}) {
  const [id, setId] = useState<string | null>(defaultValue ?? null);
  const [preview, setPreview] = useState<string | null>(defaultPreview ?? null);
  const [kind, setKind] = useState<string>("image");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    listMedia({ limit: 120 }).then((d) => {
      setItems(d as MediaLite[]);
      setLoading(false);
    });
  }, [open]);

  function choose(m: MediaLite) {
    setId(m.id);
    setPreview(m.public_url);
    setKind(m.kind);
    setOpen(false);
  }

  function clear() {
    setId(null);
    setPreview(null);
  }

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.set("file", file);
    fd.set("folder", folder);
    startTransition(async () => {
      const res = await uploadMedia(fd);
      if (res.ok) {
        toast.success("Uploaded");
        const m = { id: res.asset.id, public_url: res.asset.public_url, kind: res.asset.kind, alt: res.asset.alt, title: null };
        setItems((prev) => [m, ...prev]);
        choose(m);
      } else {
        toast.error(res.message);
      }
    });
  }

  return (
    <div>
      <input type="hidden" name={name} value={id ?? ""} />
      <div className="flex items-center gap-3">
        <div className="relative h-20 w-20 flex-none overflow-hidden rounded-xl border border-brand-100 bg-brand-50">
          {preview ? (
            kind === "video" ? (
              <span className="grid h-full w-full place-items-center bg-brand-900 text-white"><Play className="h-6 w-6" /></span>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="h-full w-full object-cover" />
            )
          ) : (
            <span className="grid h-full w-full place-items-center text-brand-300"><ImagePlus className="h-7 w-7" /></span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button type="button" onClick={() => setOpen(true)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-brand-200 px-3 text-sm font-semibold text-brand-700 hover:bg-brand-50">
            <ImagePlus className="h-4 w-4" /> {preview ? "Change" : `Choose ${label}`}
          </button>
          {preview && (
            <button type="button" onClick={clear} className="inline-flex h-8 items-center gap-1.5 px-1 text-xs font-semibold text-red-600 hover:text-red-700">
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </button>
          )}
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={`Select ${label}`} description="Pick from your library or upload a new file." size="lg">
        <label className="mb-4 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-200 text-sm font-semibold text-brand-700 hover:bg-brand-50">
          {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          {pending ? "Uploading..." : "Upload new file"}
          <input type="file" className="hidden" accept="image/*,video/*" onChange={onUpload} disabled={pending} />
        </label>

        {loading ? (
          <div className="grid h-40 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-brand-400" /></div>
        ) : (
          <div className="grid max-h-[50vh] grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
            {items.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => choose(m)}
                className={`relative aspect-square overflow-hidden rounded-xl ring-2 transition ${id === m.id ? "ring-brand-500" : "ring-transparent hover:ring-brand-200"}`}
              >
                {m.kind === "video" ? (
                  <span className="grid h-full w-full place-items-center bg-brand-900 text-white"><Play className="h-6 w-6" /></span>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.public_url} alt={m.alt ?? ""} className="h-full w-full object-cover" loading="lazy" />
                )}
                {id === m.id && <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-white"><Check className="h-3 w-3" /></span>}
              </button>
            ))}
            {items.length === 0 && <p className="col-span-full py-8 text-center text-sm text-muted">No media yet. Upload one above.</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}
