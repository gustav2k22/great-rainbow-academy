"use client";

import Image from "next/image";
import { useState } from "react";
import { cn, aspectRatio } from "@/lib/utils";

interface SmartImageProps {
  src?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
  /** Force an aspect ratio (e.g. "16 / 9"). Defaults to intrinsic, else 4/3. */
  aspect?: string;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
  rounded?: boolean;
  fit?: "cover" | "contain";
}

const FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 75'><rect width='100' height='75' fill='%23ede9fe'/><text x='50' y='40' font-size='8' fill='%237c3aed' text-anchor='middle' font-family='sans-serif'>Image</text></svg>`
  );

/**
 * Aspect-ratio-aware image with a shimmer placeholder and fade-in.
 * The container keeps layout stable; the image never breaks the grid.
 */
export function SmartImage({
  src,
  alt,
  width,
  height,
  aspect,
  className,
  imgClassName,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  rounded = true,
  fit = "cover",
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const ratio = aspect ?? aspectRatio(width, height);

  return (
    <div
      className={cn("relative overflow-hidden bg-brand-100/40", rounded && "rounded-2xl", className)}
      style={{ aspectRatio: ratio }}
    >
      {!loaded && <div className="absolute inset-0 shimmer-bg" aria-hidden />}
      <Image
        src={errored || !src ? FALLBACK : src}
        alt={alt ?? ""}
        fill
        sizes={sizes}
        priority={priority}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setErrored(true);
          setLoaded(true);
        }}
        className={cn(
          fit === "cover" ? "object-cover" : "object-contain",
          "transition-all duration-700 ease-out will-change-[opacity,transform]",
          loaded ? "scale-100 opacity-100 blur-0" : "scale-105 opacity-0 blur-md",
          imgClassName
        )}
      />
    </div>
  );
}
