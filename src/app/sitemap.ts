import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { getEvents } from "@/lib/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, "");
  const routes = [
    "", "/about", "/departments", "/academics", "/activities",
    "/admissions", "/staff", "/gallery", "/events", "/contact",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  let events: { slug: string; updated_at?: string }[] = [];
  try {
    events = await getEvents();
  } catch {}

  const eventRoutes = events.map((e) => ({
    url: `${base}/events/${e.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...routes, ...eventRoutes];
}
