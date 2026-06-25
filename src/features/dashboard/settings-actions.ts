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

// ---- Notification (messaging) preferences ----------------------
export async function saveMessaging(messaging: Record<string, unknown>) {
  await requireAuth(["system_administrator"]);
  const supabase = createAdminClient();
  const { error } = await supabase.from("site_settings").update({ messaging }).eq("id", 1);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/dashboard/settings");
  return { ok: true };
}

export async function sendTestNotification(channel: "email" | "sms", to: string) {
  await requireAuth(["system_administrator"]);
  const { dispatch, baseEmail } = await import("@/lib/messaging");
  if (channel === "email") {
    const html = baseEmail({
      heading: "Test notification ✅",
      intro: "If you can read this, your email delivery is working.",
      bodyHtml: "<p>This is a test message from your Great Rainbow Academy dashboard.</p>",
    });
    const res = await dispatch({ channels: ["email"], category: "test", emails: [to], email: { subject: "Test notification from Great Rainbow Academy", html } });
    if (res.emailSent > 0) return { ok: true, message: `Test email sent to ${to}.` };
    return { ok: false, message: res.emailConfigured ? "Email provider rejected the message. Check the delivery log." : "No email provider configured (add a Resend or SMTP key)." };
  }
  const res = await dispatch({ channels: ["sms"], category: "test", phones: [to], smsMessage: "Test SMS from Great Rainbow Academy dashboard." });
  if (res.smsSent > 0) return { ok: true, message: `Test SMS sent to ${to}.` };
  return { ok: false, message: res.smsConfigured ? "SMS provider rejected the message. Check the delivery log." : "No SMS provider configured (add SMS credentials)." };
}
