import { requireAuth, ADMIN_ROLES } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashHeader, Pill } from "@/components/dashboard/ui";
import { Icon } from "@/components/ui/icon";
import { ResourceTable, type FieldDef, type ColumnDef } from "@/features/dashboard/resource-table";

export const dynamic = "force-dynamic";
const LIST = "/dashboard/subjects";

export default async function SubjectsAdmin() {
  await requireAuth(ADMIN_ROLES);
  const supabase = createAdminClient();
  const { data } = await supabase.from("subjects").select("*").order("sort_order");

  const columns: ColumnDef<any>[] = [
    { key: "name", label: "Subject", render: (r) => (
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600"><Icon name={r.icon} className="h-5 w-5" /></span>
        <span className="font-semibold text-ink">{r.name}</span>
      </div>
    ) },
    { key: "sort_order", label: "Order" },
    { key: "is_published", label: "Status", render: (r) => <Pill tone={r.is_published ? "green" : "gray"}>{r.is_published ? "Published" : "Hidden"}</Pill> },
  ];
  const fields: FieldDef[] = [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea", full: true },
    { name: "icon", label: "Icon", type: "icon" },
    { name: "sort_order", label: "Sort Order", type: "number", defaultValue: 0 },
    { name: "is_published", label: "Published", type: "checkbox", defaultValue: true },
  ];

  return (
    <div>
      <DashHeader title="Subjects" description="Curriculum subjects shown on the Academics page." />
      <ResourceTable table="subjects" listPath={LIST} rows={data ?? []} columns={columns} fields={fields} title="Subject" addLabel="Add Subject" />
    </div>
  );
}
