"use server";

import { revalidatePath } from "next/cache";
import { requireAuth, ADMIN_ROLES, STAFF_ROLES } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { dispatch, baseEmail, type Channel } from "@/lib/messaging";

// ---- Contact messages -----------------------------------------
export async function setMessageStatus(id: string, status: "new" | "read" | "archived") {
  await requireAuth(STAFF_ROLES);
  const supabase = createAdminClient();
  const { error } = await supabase.from("contact_messages").update({ status }).eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/dashboard/messages");
  return { ok: true };
}

export async function deleteMessage(id: string) {
  await requireAuth(ADMIN_ROLES);
  const supabase = createAdminClient();
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/dashboard/messages");
  return { ok: true };
}

// ---- Newsletter subscribers -----------------------------------
export async function removeSubscriber(id: string) {
  await requireAuth(ADMIN_ROLES);
  const supabase = createAdminClient();
  const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/dashboard/newsletter");
  return { ok: true };
}

// ---- Newsletter campaigns -------------------------------------
export async function saveNewsletter(id: string | null, values: { subject: string; preview?: string; body?: string }) {
  await requireAuth(ADMIN_ROLES);
  const supabase = createAdminClient();
  let res;
  if (id) res = await supabase.from("newsletters").update(values).eq("id", id).select("id").single();
  else res = await supabase.from("newsletters").insert({ ...values, status: "draft" }).select("id").single();
  if (res.error) return { ok: false, message: res.error.message };
  revalidatePath("/dashboard/newsletter");
  return { ok: true, id: res.data?.id };
}

export async function deleteNewsletter(id: string) {
  await requireAuth(ADMIN_ROLES);
  const supabase = createAdminClient();
  const { error } = await supabase.from("newsletters").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/dashboard/newsletter");
  return { ok: true };
}

function bodyToHtml(body?: string | null) {
  if (!body) return "";
  return body
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px;">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

export async function sendNewsletter(id: string, channels: Channel[]) {
  await requireAuth(ADMIN_ROLES);
  const supabase = createAdminClient();

  const { data: nl } = await supabase.from("newsletters").select("*").eq("id", id).maybeSingle();
  if (!nl) return { ok: false, message: "Campaign not found." };

  const { data: subs } = await supabase
    .from("newsletter_subscribers")
    .select("email, phone")
    .eq("status", "subscribed");

  const emails = (subs ?? []).map((s) => s.email).filter(Boolean) as string[];
  const phones = (subs ?? []).map((s) => s.phone).filter(Boolean) as string[];

  const html = baseEmail({ heading: nl.subject, intro: nl.preview ?? undefined, bodyHtml: bodyToHtml(nl.body) });
  const smsMessage = `${nl.subject}${nl.preview ? ": " + nl.preview : ""}`.slice(0, 300);

  const res = await dispatch({
    channels,
    category: "newsletter",
    emails,
    phones,
    email: { subject: nl.subject, html },
    smsMessage,
  });

  const { error } = await supabase
    .from("newsletters")
    .update({
      status: "published",
      sent_at: new Date().toISOString(),
      channels,
      email_count: res.emailSent,
      sms_count: res.smsSent,
      recipients: res.emailSent + res.smsSent,
    })
    .eq("id", id);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/dashboard/newsletter");
  return {
    ok: true,
    emailSent: res.emailSent,
    smsSent: res.smsSent,
    emailConfigured: res.emailConfigured,
    smsConfigured: res.smsConfigured,
    channels,
  };
}
