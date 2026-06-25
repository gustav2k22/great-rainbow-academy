"use client";

import { motion } from "framer-motion";
import { Play, ZoomIn } from "lucide-react";
import { SmartImage } from "@/components/media/smart-image";
import { useLightbox, type LightboxMedia } from "@/components/media/lightbox";
import { isVideo } from "@/lib/utils";

export interface GalleryMedia {
  url: string;
  kind?: "image" | "video" | "document";
  alt?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
}

/**
 * Aspect-aware, masonry-style media grid. Images keep their natural
 * ratio; videos show a poster tile with a play affordance. Clicking
 * any tile opens the shared lightbox.
 */
export function GalleryGrid({ items }: { items: GalleryMedia[] }) {
  const { open } = useLightbox();

  const lightboxItems: LightboxMedia[] = items.map((m) => ({
    url: m.url,
    type: m.kind === "video" || isVideo(m.url) ? "video" : "image",
    alt: m.alt,
    caption: m.caption,
  }));

  if (!items.length) {
    return <p className="text-center text-muted">No media yet. Please check back soon.</p>;
  }

  return (
    <div className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4 [&>*]:mb-3 sm:[&>*]:mb-4">
      {items.map((m, i) => {
        const video = m.kind === "video" || isVideo(m.url);
        return (
          <motion.button
            key={m.url + i}
            type="button"
            onClick={() => open(lightboxItems, i)}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: (i % 8) * 0.04 }}
            className="group relative block w-full break-inside-avoid overflow-hidden rounded-2xl ring-1 ring-brand-100/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            {video ? (
              <div
                className="relative flex items-center justify-center bg-brand-900"
                style={{ aspectRatio: "9 / 14" }}
              >
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
            <span className="pointer-events-none absolute inset-0 flex items-end justify-end bg-gradient-to-t from-black/40 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <ZoomIn className="h-5 w-5 text-white" />
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
