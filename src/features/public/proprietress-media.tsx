"use client";

import { Play } from "lucide-react";
import { SmartImage } from "@/components/media/smart-image";
import { useLightbox } from "@/components/media/lightbox";

export function ProprietressMedia({
  imageUrl,
  videoUrl,
  name,
}: {
  imageUrl?: string | null;
  videoUrl?: string | null;
  name: string;
}) {
  const { open } = useLightbox();

  return (
    <div className="relative mx-auto max-w-sm">
      <SmartImage
        src={imageUrl}
        alt={name}
        aspect="4 / 5"
        className="shadow-2xl ring-4 ring-white/10"
        sizes="(max-width:1024px) 100vw, 40vw"
      />
      {videoUrl && (
        <button
          onClick={() => open([{ url: videoUrl, type: "video", caption: `A welcome from ${name}` }], 0)}
          className="group absolute inset-0 grid place-items-center"
          aria-label="Play welcome video"
        >
          <span className="grid h-20 w-20 place-items-center rounded-full bg-white/90 text-brand-700 shadow-2xl transition group-hover:scale-110">
            <Play className="h-9 w-9 translate-x-0.5 fill-current" />
          </span>
          <span className="absolute inset-0 animate-ping rounded-2xl ring-2 ring-white/40" style={{ animationDuration: "2.5s" }} />
        </button>
      )}
    </div>
  );
}
