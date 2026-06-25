"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const TEACH = ["system_administrator", "school_administrator", "teacher"] as const;

export async function saveAttendance(
  classId: string,
  date: string,
  records: { student_id: string; status: string }[]
) {
  const me = await requireAuth([...TEACH]);
  const supabase = createAdminClient();

  const rows = records.map((r) => ({
    student_id: r.student_id,
    class_id: classId,
    date,
    status: r.status,
    recorded_by: me.id,
  }));

  const { error } = await supabase.from("attendance").upsert(rows, { onConflict: "student_id,date" });
  if (error) return { ok: false, message: error.message };
  revalidatePath("/dashboard/attendance");
  return { ok: true };
}
