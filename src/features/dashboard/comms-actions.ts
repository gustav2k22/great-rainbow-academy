"use server";

import { revalidatePath } from "next/cache";
import { requireAuth, ADMIN_ROLES, STAFF_ROLES } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

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

export async function sendNewsletter(id: string) {
  await requireAuth(ADMIN_ROLES);
  const supabase = createAdminClient();
  const { count } = await supabase
    .from("newsletter_subscribers")
    .select("*", { count: "exact", head: true })
    .eq("status", "subscribed");
  const { error } = await supabase
    .from("newsletters")
    .update({ status: "published", sent_at: new Date().toISOString(), recipients: count ?? 0 })
    .eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/dashboard/newsletter");
  return { ok: true, recipients: count ?? 0 };
}
