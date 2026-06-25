"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/types";

const ROLES: UserRole[] = ["system_administrator", "school_administrator", "teacher", "staff"];

const createSchema = z.object({
  full_name: z.string().trim().min(2, "Name is required."),
  email: z.string().email("Valid email required."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(["system_administrator", "school_administrator", "teacher", "staff"]),
  phone: z.string().trim().optional().or(z.literal("")),
});

export async function createStaffUser(formData: FormData) {
  await requireAuth(["system_administrator"]);
  const parsed = createSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message };
  const d = parsed.data;
  const supabase = createAdminClient();

  const { data, error } = await supabase.auth.admin.createUser({
    email: d.email,
    password: d.password,
    email_confirm: true,
    user_metadata: { full_name: d.full_name, role: d.role },
  });
  if (error) return { ok: false, message: error.message };

  await supabase.from("profiles").upsert({
    id: data.user.id, email: d.email, full_name: d.full_name, role: d.role,
    phone: d.phone || null, status: "active",
  });
  revalidatePath("/dashboard/users");
  return { ok: true };
}

export async function updateUser(id: string, values: { full_name?: string; role?: UserRole; phone?: string; status?: string }) {
  await requireAuth(["system_administrator"]);
  if (values.role && !ROLES.includes(values.role)) return { ok: false, message: "Invalid role." };
  const supabase = createAdminClient();
  const { error } = await supabase.from("profiles").update(values).eq("id", id);
  if (error) return { ok: false, message: error.message };
  if (values.role) {
    await supabase.auth.admin.updateUserById(id, { user_metadata: { role: values.role, full_name: values.full_name } });
  }
  revalidatePath("/dashboard/users");
  return { ok: true };
}

export async function resetUserPassword(id: string, password: string) {
  await requireAuth(["system_administrator"]);
  if (password.length < 8) return { ok: false, message: "Password must be at least 8 characters." };
  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.updateUserById(id, { password });
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function deleteStaffUser(id: string) {
  await requireAuth(["system_administrator"]);
  const me = await requireAuth(["system_administrator"]);
  if (me.id === id) return { ok: false, message: "You cannot delete your own account." };
  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/dashboard/users");
  return { ok: true };
}
