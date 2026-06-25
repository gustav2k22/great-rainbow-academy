import { requireAuth, STAFF_ROLES } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashHeader, Pill } from "@/components/dashboard/ui";
import { ResourceTable, type FieldDef, type ColumnDef } from "@/features/dashboard/resource-table";
import { initials, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
const LIST = "/dashboard/students";

export default async function StudentsAdmin() {
  await requireAuth(STAFF_ROLES);
  const supabase = createAdminClient();
  const [{ data: studentsRaw }, { data: classes }] = await Promise.all([
    supabase.from("students").select("*, class:class_id(name), photo:photo_id(public_url)").order("created_at", { ascending: false }),
    supabase.from("school_classes").select("id, name").order("name"),
  ]);

  const rows = (studentsRaw ?? []).map((s: any) => ({
    ...s,
    class_name: s.class?.name ?? "Unassigned",
    photo_id_preview: s.photo?.public_url ?? null,
  }));

  const classOptions = (classes ?? []).map((c: any) => ({ value: c.id, label: c.name }));

  const columns: ColumnDef<any>[] = [
    { key: "name", label: "Student", render: (r) => (
      <div className="flex items-center gap-3">
        {r.photo?.public_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.photo.public_url} alt="" className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-600">{initials(`${r.first_name} ${r.last_name}`)}</span>
        )}
        <div>
          <p className="font-semibold text-ink">{r.first_name} {r.last_name}</p>
          <p className="text-xs text-muted">{r.student_no}</p>
        </div>
      </div>
    ) },
    { key: "class_name", label: "Class" },
    { key: "guardian_name", label: "Guardian", render: (r) => (
      <div><p className="text-ink">{r.guardian_name || "Not set"}</p><p className="text-xs text-muted">{r.guardian_phone}</p></div>
    ) },
    { key: "admission_date", label: "Admitted", render: (r) => formatDate(r.admission_date) },
    { key: "status", label: "Status", render: (r) => <Pill tone={r.status === "active" ? "green" : r.status === "graduated" ? "blue" : "gray"}>{r.status}</Pill> },
  ];

  const fields: FieldDef[] = [
    { name: "student_no", label: "Student No.", type: "text", required: true, help: "A unique ID, e.g. GRA/2025/001" },
    { name: "first_name", label: "First Name", type: "text", required: true },
    { name: "last_name", label: "Last Name", type: "text", required: true },
    { name: "gender", label: "Gender", type: "select", options: [{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }] },
    { name: "date_of_birth", label: "Date of Birth", type: "date" },
    { name: "class_id", label: "Class", type: "select", options: classOptions },
    { name: "photo_id", label: "Photo", type: "media", mediaFolder: "students" },
    { name: "guardian_name", label: "Guardian Name", type: "text" },
    { name: "guardian_phone", label: "Guardian Phone", type: "text" },
    { name: "guardian_email", label: "Guardian Email", type: "text" },
    { name: "address", label: "Address", type: "text", full: true },
    { name: "admission_date", label: "Admission Date", type: "date" },
    { name: "status", label: "Status", type: "select", defaultValue: "active", options: [
      { value: "active", label: "Active" }, { value: "graduated", label: "Graduated" },
      { value: "withdrawn", label: "Withdrawn" }, { value: "suspended", label: "Suspended" },
    ] },
    { name: "notes", label: "Notes", type: "textarea", full: true },
  ];

  return (
    <div>
      <DashHeader title="Students" description="Manage student records, classes and guardians." />
      <ResourceTable table="students" listPath={LIST} rows={rows} columns={columns} fields={fields} title="Student" addLabel="Add Student" />
    </div>
  );
}
