import { requireAuth, ADMIN_ROLES } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashHeader, Pill } from "@/components/dashboard/ui";
import { Icon } from "@/components/ui/icon";
import { ResourceTable, type FieldDef, type ColumnDef } from "@/features/dashboard/resource-table";

export const dynamic = "force-dynamic";
const LIST = "/dashboard/departments";

export default async function DepartmentsAdmin() {
  await requireAuth(ADMIN_ROLES);
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("departments")
    .select("*, image:image_id(public_url)")
    .order("sort_order");

  const rows = (data ?? []).map((r: any) => ({ ...r, image_id_preview: r.image?.public_url ?? null }));

  const columns: ColumnDef<any>[] = [
    { key: "name", label: "Department", render: (r) => (
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg text-white" style={{ background: r.color ?? "#7c3aed" }}>
          <Icon name={r.icon} className="h-5 w-5" />
        </span>
        <div>
          <p className="font-semibold text-ink">{r.name}</p>
          <p className="text-xs text-muted">{r.tagline}</p>
        </div>
      </div>
    ) },
    { key: "sort_order", label: "Order" },
    { key: "is_published", label: "Status", render: (r) => <Pill tone={r.is_published ? "green" : "gray"}>{r.is_published ? "Published" : "Hidden"}</Pill> },
  ];

  const fields: FieldDef[] = [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "slug", label: "Slug", type: "text", required: true, help: "Used in links, e.g. 'nursery'." },
    { name: "tagline", label: "Tagline", type: "text" },
    { name: "description", label: "Description", type: "textarea", full: true },
    { name: "icon", label: "Icon", type: "icon" },
    { name: "color", label: "Accent Color", type: "color" },
    { name: "image_id", label: "Image", type: "media", mediaFolder: "departments" },
    { name: "sort_order", label: "Sort Order", type: "number", defaultValue: 0 },
    { name: "is_published", label: "Published", type: "checkbox", defaultValue: true },
  ];

  return (
    <div>
      <DashHeader title="Departments" description="Manage the departments shown on the public website." />
      <ResourceTable table="departments" listPath={LIST} rows={rows} columns={columns} fields={fields} title="Department" addLabel="Add Department" />
    </div>
  );
}
