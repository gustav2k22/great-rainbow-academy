import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer-bg rounded-lg bg-brand-100/40", className)} />;
}

/** Inline SVG shimmer used as a next/image blur placeholder (data URI). */
export function shimmerDataURL(w = 700, h = 475) {
  const svg = `
  <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g">
        <stop stop-color="#ede9fe" offset="20%" />
        <stop stop-color="#ddd6fe" offset="50%" />
        <stop stop-color="#ede9fe" offset="70%" />
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="#ede9fe" />
    <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
    <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1.4s" repeatCount="indefinite" />
  </svg>`;
  const toBase64 = (str: string) =>
    typeof window === "undefined" ? Buffer.from(str).toString("base64") : window.btoa(str);
  return `data:image/svg+xml;base64,${toBase64(svg)}`;
}
