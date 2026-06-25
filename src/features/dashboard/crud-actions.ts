"use server";

import { revalidatePath } from "next/cache";
import { requireAuth, ADMIN_ROLES, STAFF_ROLES } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/types";

const TEACH: UserRole[] = ["system_administrator", "school_administrator", "teacher"];

/** Allowlist: which tables can be edited, by whom, and what to revalidate. */
const TABLES: Record<string, { roles: UserRole[]; revalidate: string[] }> = {
  // CMS
  departments: { roles: ADMIN_ROLES, revalidate: ["/", "/departments", "/admissions"] },
  subjects: { roles: ADMIN_ROLES, revalidate: ["/academics"] },
  activities: { roles: ADMIN_ROLES, revalidate: ["/", "/activities"] },
  core_values: { roles: ADMIN_ROLES, revalidate: ["/", "/about"] },
  faqs: { roles: ADMIN_ROLES, revalidate: ["/academics"] },
  testimonials: { roles: ADMIN_ROLES, revalidate: ["/"] },
  staff_members: { roles: ADMIN_ROLES, revalidate: ["/staff", "/"] },
  events: { roles: ADMIN_ROLES, revalidate: ["/", "/events", "/activities"] },
  gallery_albums: { roles: ADMIN_ROLES, revalidate: ["/gallery", "/"] },
  gallery_items: { roles: ADMIN_ROLES, revalidate: ["/gallery", "/"] },
  site_stats: { roles: ADMIN_ROLES, revalidate: ["/"] },
  page_sections: { roles: ADMIN_ROLES, revalidate: ["/", "/about", "/admissions"] },
  // SMS
  students: { roles: STAFF_ROLES, revalidate: [] },
  school_classes: { roles: TEACH, revalidate: [] },
  attendance: { roles: TEACH, revalidate: [] },
  exams: { roles: TEACH, revalidate: [] },
  grades: { roles: TEACH, revalidate: [] },
  fee_structures: { roles: ADMIN_ROLES, revalidate: [] },
  fee_invoices: { roles: ADMIN_ROLES, revalidate: [] },
  payments: { roles: ADMIN_ROLES, revalidate: [] },
  announcements: { roles: STAFF_ROLES, revalidate: [] },
  admission_applications: { roles: STAFF_ROLES, revalidate: [] },
  newsletters: { roles: ADMIN_ROLES, revalidate: [] },
  academic_years: { roles: ADMIN_ROLES, revalidate: [] },
  terms: { roles: ADMIN_ROLES, revalidate: [] },
};

export type CrudResult = { ok: boolean; message?: string; id?: string };

function clean(values: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(values)) {
    if (v === "" ) out[k] = null;
    else out[k] = v;
  }
  return out;
}

export async function saveRecord(
  table: string,
  id: string | null,
  values: Record<string, any>,
  listPath?: string
): Promise<CrudResult> {
  const cfg = TABLES[table];
  if (!cfg) return { ok: false, message: "This resource cannot be edited." };
  await requireAuth(cfg.roles);

  const supabase = createAdminClient();
  const payload = clean(values);

  let result;
  if (id) {
    result = await supabase.from(table).update(payload).eq("id", id).select("id").single();
  } else {
    result = await supabase.from(table).insert(payload).select("id").single();
  }
  if (result.error) return { ok: false, message: result.error.message };

  cfg.revalidate.forEach((p) => revalidatePath(p));
  if (listPath) revalidatePath(listPath);
  return { ok: true, id: result.data?.id };
}

export async function deleteRecord(table: string, id: string, listPath?: string): Promise<CrudResult> {
  const cfg = TABLES[table];
  if (!cfg) return { ok: false, message: "This resource cannot be deleted." };
  await requireAuth(cfg.roles);

  const supabase = createAdminClient();
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) return { ok: false, message: error.message };

  cfg.revalidate.forEach((p) => revalidatePath(p));
  if (listPath) revalidatePath(listPath);
  return { ok: true };
}

export async function toggleBoolean(
  table: string,
  id: string,
  field: string,
  value: boolean,
  listPath?: string
): Promise<CrudResult> {
  const cfg = TABLES[table];
  if (!cfg) return { ok: false, message: "Not allowed." };
  await requireAuth(cfg.roles);
  const supabase = createAdminClient();
  const { error } = await supabase.from(table).update({ [field]: value }).eq("id", id);
  if (error) return { ok: false, message: error.message };
  cfg.revalidate.forEach((p) => revalidatePath(p));
  if (listPath) revalidatePath(listPath);
  return { ok: true };
}
