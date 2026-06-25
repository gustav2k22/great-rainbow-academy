"use server";

import { revalidatePath } from "next/cache";
import { requireAuth, ADMIN_ROLES } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

async function urlForMedia(id: string | null): Promise<string | null> {
  if (!id) return null;
  const supabase = createAdminClient();
  const { data } = await supabase.from("media_assets").select("public_url").eq("id", id).maybeSingle();
  return data?.public_url ?? null;
}

export async function saveSettings(formData: FormData) {
  await requireAuth(["system_administrator"]);
  const supabase = createAdminClient();

  const logoId = (formData.get("logo_media_id") as string) || null;
  const ogId = (formData.get("og_media_id") as string) || null;
  const logoUrl = logoId ? await urlForMedia(logoId) : (formData.get("logo_url") as string) || null;
  const ogUrl = ogId ? await urlForMedia(ogId) : (formData.get("og_image_url") as string) || null;

  const phones = String(formData.get("phones") || "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const social_links = {
    facebook: (formData.get("facebook") as string) || "",
    instagram: (formData.get("instagram") as string) || "",
    youtube: (formData.get("youtube") as string) || "",
    tiktok: (formData.get("tiktok") as string) || "",
  };

  const payload = {
    school_name: formData.get("school_name") as string,
    tagline: formData.get("tagline") as string,
    motto: formData.get("motto") as string,
    email: (formData.get("email") as string) || null,
    address: (formData.get("address") as string) || null,
    whatsapp: (formData.get("whatsapp") as string) || null,
    phones,
    social_links,
    seo_title: (formData.get("seo_title") as string) || null,
    seo_description: (formData.get("seo_description") as string) || null,
    primary_color: (formData.get("primary_color") as string) || "#7c3aed",
    ...(logoUrl ? { logo_url: logoUrl } : {}),
    ...(ogUrl ? { og_image_url: ogUrl } : {}),
  };

  const { error } = await supabase.from("site_settings").update(payload).eq("id", 1);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}
