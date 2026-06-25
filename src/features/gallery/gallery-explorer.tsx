"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play, ZoomIn, ImageOff } from "lucide-react";
import { SmartImage } from "@/components/media/smart-image";
import { FilterChips, type FilterOption } from "@/components/ui/filter-chips";
import { useLightbox, type LightboxMedia } from "@/components/media/lightbox";
import { isVideo } from "@/lib/utils";

export interface GalleryEntry {
  url: string;
  kind?: "image" | "video" | "document";
  alt?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  albumSlug?: string | null;
  albumTitle?: string | null;
}

/**
 * Filterable, animated gallery. Filter by media type and album; items
 * smoothly re-flow (framer-motion layout) and fade in/out on change.
 * The masonry uses CSS grid row-spans derived from each item's aspect.
 */
export function GalleryExplorer({
  items,
  albums,
}: {
  items: GalleryEntry[];
  albums: { slug: string; title: string }[];
}) {
  const { open } = useLightbox();
  const [type, setType] = useState("all");
  const [album, setAlbum] = useState("all");

  const isVid = (m: GalleryEntry) => m.kind === "video" || isVideo(m.url);

  const typeOptions: FilterOption[] = [
    { value: "all", label: "All", count: items.length },
    { value: "image", label: "Photos", count: items.filter((m) => !isVid(m)).length },
    { value: "video", label: "Videos", count: items.filter((m) => isVid(m)).length },
  ];
  const albumOptions: FilterOption[] = [
    { value: "all", label: "All Albums" },
    ...albums.map((a) => ({ value: a.slug, label: a.title, count: items.filter((m) => m.albumSlug === a.slug).length })),
  ];

  const filtered = useMemo(
    () =>
      items.filter((m) => {
        if (type === "image" && isVid(m)) return false;
        if (type === "video" && !isVid(m)) return false;
        if (album !== "all" && m.albumSlug !== album) return false;
        return true;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, type, album]
  );

  const lightboxItems: LightboxMedia[] = filtered.map((m) => ({
    url: m.url,
    type: isVid(m) ? "video" : "image",
    alt: m.alt,
    caption: m.caption,
  }));

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterChips options={typeOptions} value={type} onChange={setType} layoutId="gallery-type" />
        {albums.length > 1 && (
          <FilterChips options={albumOptions} value={album} onChange={setAlbum} layoutId="gallery-album" size="sm" />
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center text-muted">
          <ImageOff className="h-10 w-10 text-brand-300" />
          <p>No media matches this filter.</p>
        </div>
      ) : (
        <div className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4 [&>*]:mb-3 sm:[&>*]:mb-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((m, i) => {
              const video = isVid(m);
              return (
                <motion.button
                  key={m.url}
                  type="button"
                  onClick={() => open(lightboxItems, i)}
                  initial={{ opacity: 0, scale: 0.92, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 320, damping: 30, delay: (i % 10) * 0.03 }}
                  className="group relative block w-full break-inside-avoid overflow-hidden rounded-2xl ring-1 ring-brand-100/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                >
                  {video ? (
                    <div className="relative flex items-center justify-center bg-brand-900" style={{ aspectRatio: "9 / 14" }}>
                      <video src={m.url} muted playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover opacity-90" />
                      <span className="relative z-10 grid h-14 w-14 place-items-center rounded-full bg-white/85 text-brand-700 shadow-lg transition group-hover:scale-110">
                        <Play className="h-6 w-6 translate-x-0.5 fill-current" />
                      </span>
                    </div>
                  ) : (
                    <SmartImage
                      src={m.url}
                      alt={m.alt}
                      width={m.width}
                      height={m.height}
                      sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
                      className="!rounded-2xl"
                    />
                  )}
                  <span className="pointer-events-none absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/55 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {m.albumTitle && <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-brand-700">{m.albumTitle}</span>}
                    <ZoomIn className="ml-auto h-5 w-5 text-white" />
                  </span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
