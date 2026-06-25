import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

async function count(table: string, filter?: (q: any) => any) {
  const supabase = createAdminClient();
  let q = supabase.from(table).select("*", { count: "exact", head: true });
  if (filter) q = filter(q);
  const { count: c } = await q;
  return c ?? 0;
}

export async function getDashboardStats() {
  const [students, classes, staff, admissionsNew, events, subscribers, messagesNew, applicationsTotal] =
    await Promise.all([
      count("students", (q) => q.eq("status", "active")),
      count("school_classes"),
      count("profiles", (q) => q.in("role", ["teacher", "staff", "school_administrator", "system_administrator"])),
      count("admission_applications", (q) => q.eq("stage", "new")),
      count("events", (q) => q.eq("status", "published")),
      count("newsletter_subscribers", (q) => q.eq("status", "subscribed")),
      count("contact_messages", (q) => q.eq("status", "new")),
      count("admission_applications"),
    ]);
  return { students, classes, staff, admissionsNew, events, subscribers, messagesNew, applicationsTotal };
}

export async function getRecentAdmissions(limit = 5) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("admission_applications")
    .select("id, reference, child_first_name, child_last_name, applying_for, stage, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getRecentMessages(limit = 5) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("contact_messages")
    .select("id, name, subject, status, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}
