import { requireAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashHeader, Pill } from "@/components/dashboard/ui";
import { ResourceTable, type FieldDef, type ColumnDef } from "@/features/dashboard/resource-table";

export const dynamic = "force-dynamic";
const LIST = "/dashboard/grades";

export default async function GradesAdmin() {
  await requireAuth(["system_administrator", "school_administrator", "teacher"]);
  const supabase = createAdminClient();
  const [{ data: gradesRaw }, { data: students }, { data: subjects }] = await Promise.all([
    supabase.from("grades").select("*, student:student_id(first_name,last_name), subject:subject_id(name)").order("created_at", { ascending: false }).limit(300),
    supabase.from("students").select("id, first_name, last_name").eq("status", "active").order("first_name"),
    supabase.from("subjects").select("id, name").order("name"),
  ]);

  const rows = (gradesRaw ?? []).map((g: any) => ({
    ...g,
    student_name: g.student ? `${g.student.first_name} ${g.student.last_name}` : "Unknown",
    subject_label: g.subject?.name ?? g.subject_name ?? "Subject",
  }));
  const studentOptions = (students ?? []).map((s: any) => ({ value: s.id, label: `${s.first_name} ${s.last_name}` }));
  const subjectOptions = (subjects ?? []).map((s: any) => ({ value: s.id, label: s.name }));

  const columns: ColumnDef<any>[] = [
    { key: "student_name", label: "Student", render: (r) => <span className="font-semibold text-ink">{r.student_name}</span> },
    { key: "subject_label", label: "Subject" },
    { key: "score", label: "Score", render: (r) => <span className="font-semibold">{r.score ?? "-"}</span> },
    { key: "grade", label: "Grade", render: (r) => r.grade ? <Pill tone="violet">{r.grade}</Pill> : "-" },
    { key: "remark", label: "Remark", render: (r) => <span className="text-muted">{r.remark}</span> },
  ];
  const fields: FieldDef[] = [
    { name: "student_id", label: "Student", type: "select", required: true, options: studentOptions },
    { name: "subject_id", label: "Subject", type: "select", required: true, options: subjectOptions },
    { name: "score", label: "Score", type: "number" },
    { name: "grade", label: "Grade", type: "text", placeholder: "A, B, C..." },
    { name: "remark", label: "Remark", type: "text", full: true },
  ];

  return (
    <div>
      <DashHeader title="Grades" description="Record and review student grades." />
      <ResourceTable table="grades" listPath={LIST} rows={rows} columns={columns} fields={fields} title="Grade" addLabel="Add Grade" />
    </div>
  );
}
