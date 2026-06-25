import { requireAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashHeader, Pill } from "@/components/dashboard/ui";
import { ResourceTable, type FieldDef, type ColumnDef } from "@/features/dashboard/resource-table";

export const dynamic = "force-dynamic";
const LIST = "/dashboard/classes";

export default async function ClassesAdmin() {
  await requireAuth(["system_administrator", "school_administrator", "teacher"]);
  const supabase = createAdminClient();
  const [{ data: classesRaw }, { data: teachers }, { data: years }, { data: students }] = await Promise.all([
    supabase.from("school_classes").select("*, teacher:teacher_id(full_name)").order("name"),
    supabase.from("profiles").select("id, full_name").in("role", ["teacher", "school_administrator"]).order("full_name"),
    supabase.from("academic_years").select("id, name").order("name"),
    supabase.from("students").select("class_id"),
  ]);

  const counts: Record<string, number> = {};
  (students ?? []).forEach((s: any) => { if (s.class_id) counts[s.class_id] = (counts[s.class_id] ?? 0) + 1; });

  const rows = (classesRaw ?? []).map((c: any) => ({ ...c, teacher_name: c.teacher?.full_name ?? "Unassigned", student_count: counts[c.id] ?? 0 }));
  const teacherOptions = (teachers ?? []).map((t: any) => ({ value: t.id, label: t.full_name }));
  const yearOptions = (years ?? []).map((y: any) => ({ value: y.id, label: y.name }));

  const columns: ColumnDef<any>[] = [
    { key: "name", label: "Class", render: (r) => <span className="font-semibold text-ink">{r.name}</span> },
    { key: "level", label: "Level", render: (r) => <Pill tone="violet">{r.level}</Pill> },
    { key: "teacher_name", label: "Class Teacher" },
    { key: "student_count", label: "Students", render: (r) => `${r.student_count} / ${r.capacity}` },
  ];
  const fields: FieldDef[] = [
    { name: "name", label: "Class Name", type: "text", required: true, placeholder: "e.g. Basic 1" },
    { name: "level", label: "Level", type: "select", options: [
      { value: "Nursery", label: "Nursery" }, { value: "KG", label: "Kindergarten" },
      { value: "Primary", label: "Primary" }, { value: "JHS", label: "JHS" },
    ] },
    { name: "capacity", label: "Capacity", type: "number", defaultValue: 40 },
    { name: "teacher_id", label: "Class Teacher", type: "select", options: teacherOptions },
    { name: "academic_year_id", label: "Academic Year", type: "select", options: yearOptions },
  ];

  return (
    <div>
      <DashHeader title="Classes" description="Manage classes, levels and assigned teachers." />
      <ResourceTable table="school_classes" listPath={LIST} rows={rows} columns={columns} fields={fields} title="Class" addLabel="Add Class" />
    </div>
  );
}
