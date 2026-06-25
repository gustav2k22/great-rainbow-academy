import { requireAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashHeader } from "@/components/dashboard/ui";
import { AttendanceManager } from "@/features/dashboard/attendance-manager";

export const dynamic = "force-dynamic";

export default async function AttendanceAdmin({
  searchParams,
}: {
  searchParams: Promise<{ class_id?: string; date?: string }>;
}) {
  await requireAuth(["system_administrator", "school_administrator", "teacher"]);
  const sp = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const classId = sp.class_id ?? "";
  const date = sp.date ?? today;

  const supabase = createAdminClient();
  const { data: classes } = await supabase.from("school_classes").select("id, name").order("name");

  let students: any[] = [];
  let initial: Record<string, string> = {};
  if (classId) {
    const [{ data: st }, { data: att }] = await Promise.all([
      supabase.from("students").select("id, first_name, last_name, student_no").eq("class_id", classId).eq("status", "active").order("first_name"),
      supabase.from("attendance").select("student_id, status").eq("class_id", classId).eq("date", date),
    ]);
    students = st ?? [];
    (att ?? []).forEach((a: any) => (initial[a.student_id] = a.status));
  }

  return (
    <div>
      <DashHeader title="Attendance" description="Take and review daily attendance per class." />
      <AttendanceManager classes={classes ?? []} classId={classId} date={date} students={students} initial={initial} />
    </div>
  );
}
