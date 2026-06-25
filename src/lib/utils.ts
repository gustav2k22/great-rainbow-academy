import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function formatDate(value?: string | Date | null, opts?: Intl.DateTimeFormatOptions) {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", opts ?? { day: "numeric", month: "long", year: "numeric" }).format(d);
}

export function formatDateTime(value?: string | Date | null) {
  return formatDate(value, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function formatCurrency(amount: number, currency = "GHS") {
  return new Intl.NumberFormat("en-GH", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount || 0);
}

export function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export function truncate(text: string, max = 160) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
}

/** Aspect ratio string ("4 / 3") from width+height, with a sensible fallback. */
export function aspectRatio(width?: number | null, height?: number | null, fallback = "4 / 3") {
  if (width && height && width > 0 && height > 0) return `${width} / ${height}`;
  return fallback;
}

export function isVideo(url?: string | null) {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(url);
}
