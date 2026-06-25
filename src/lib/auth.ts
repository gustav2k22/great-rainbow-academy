import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/types";

/** Returns the current auth user + profile, or null if not signed in. */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (profile as Profile) ?? null;
}

/** Redirects to /login if not signed in; optionally enforces allowed roles. */
export async function requireAuth(allowed?: UserRole[]): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.status !== "active") redirect("/login?error=inactive");
  if (allowed && !allowed.includes(profile.role)) redirect("/dashboard?error=forbidden");
  return profile;
}

export const STAFF_ROLES: UserRole[] = [
  "system_administrator",
  "school_administrator",
  "teacher",
  "staff",
];

export const ADMIN_ROLES: UserRole[] = ["system_administrator", "school_administrator"];

export function isAdmin(role: UserRole) {
  return ADMIN_ROLES.includes(role);
}
export function isSystemAdmin(role: UserRole) {
  return role === "system_administrator";
}
