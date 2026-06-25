import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type {
  Activity,
  CoreValue,
  Department,
  Faq,
  GalleryAlbum,
  GalleryItem,
  PageSection,
  SchoolEvent,
  SiteSettings,
  SiteStat,
  StaffMember,
  Subject,
  Testimonial,
} from "@/lib/types";

const MEDIA = "media:media_id(*)";

export const getSiteSettings = cache(async (): Promise<SiteSettings | null> => {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  return (data as SiteSettings) ?? null;
});

export const getPageSections = cache(async (slug: string): Promise<Record<string, PageSection>> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("page_sections")
    .select(`*, ${MEDIA}`)
    .eq("page_slug", slug)
    .eq("is_published", true)
    .order("sort_order");
  const map: Record<string, PageSection> = {};
  (data as PageSection[] | null)?.forEach((s) => (map[s.section_key] = s));
  return map;
});

export const getPageMeta = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pages")
    .select("title, seo_title, seo_description, og_image_url")
    .eq("slug", slug)
    .maybeSingle();
  return data;
});

export const getDepartments = cache(async (): Promise<Department[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("departments")
    .select("*, image:image_id(*)")
    .eq("is_published", true)
    .order("sort_order");
  return (data as Department[]) ?? [];
});

export const getSubjects = cache(async (): Promise<Subject[]> => {
  const supabase = await createClient();
  const { data } = await supabase.from("subjects").select("*").eq("is_published", true).order("sort_order");
  return (data as Subject[]) ?? [];
});

export const getActivities = cache(async (): Promise<Activity[]> => {
  const supabase = await createClient();
  const { data } = await supabase.from("activities").select("*").eq("is_published", true).order("sort_order");
  return (data as Activity[]) ?? [];
});

export const getCoreValues = cache(async (): Promise<CoreValue[]> => {
  const supabase = await createClient();
  const { data } = await supabase.from("core_values").select("*").order("sort_order");
  return (data as CoreValue[]) ?? [];
});

export const getStaff = cache(async (): Promise<StaffMember[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("staff_members")
    .select("*, photo:photo_id(*)")
    .eq("is_published", true)
    .order("sort_order");
  return (data as StaffMember[]) ?? [];
});

export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
  const supabase = await createClient();
  const { data } = await supabase.from("testimonials").select("*").eq("is_published", true).order("sort_order");
  return (data as Testimonial[]) ?? [];
});

export const getSiteStats = cache(async (): Promise<SiteStat[]> => {
  const supabase = await createClient();
  const { data } = await supabase.from("site_stats").select("*").order("sort_order");
  return (data as SiteStat[]) ?? [];
});

export const getFaqs = cache(async (): Promise<Faq[]> => {
  const supabase = await createClient();
  const { data } = await supabase.from("faqs").select("*").eq("is_published", true).order("sort_order");
  return (data as Faq[]) ?? [];
});

export const getGalleryAlbums = cache(async (): Promise<GalleryAlbum[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("gallery_albums")
    .select("*, cover:cover_id(*)")
    .eq("is_published", true)
    .order("sort_order");
  return (data as GalleryAlbum[]) ?? [];
});

export const getGalleryItems = cache(async (albumSlug?: string): Promise<GalleryItem[]> => {
  const supabase = await createClient();
  let albumId: string | undefined;
  if (albumSlug) {
    const { data: album } = await supabase.from("gallery_albums").select("id").eq("slug", albumSlug).maybeSingle();
    albumId = album?.id;
  }
  let q = supabase.from("gallery_items").select(`*, ${MEDIA}`).order("sort_order");
  if (albumId) q = q.eq("album_id", albumId);
  const { data } = await q;
  return (data as GalleryItem[]) ?? [];
});

export const getEvents = cache(async (limit?: number): Promise<SchoolEvent[]> => {
  const supabase = await createClient();
  let q = supabase
    .from("events")
    .select("*, cover:cover_id(*)")
    .eq("status", "published")
    .order("start_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data } = await q;
  return (data as SchoolEvent[]) ?? [];
});

export const getEventBySlug = cache(async (slug: string): Promise<SchoolEvent | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*, cover:cover_id(*)")
    .eq("slug", slug)
    .maybeSingle();
  return (data as SchoolEvent) ?? null;
});
