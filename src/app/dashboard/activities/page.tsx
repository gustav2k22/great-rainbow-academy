import { requireAuth, ADMIN_ROLES } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashHeader, Pill } from "@/components/dashboard/ui";
import { Icon } from "@/components/ui/icon";
import { ResourceTable, type FieldDef, type ColumnDef } from "@/features/dashboard/resource-table";

export const dynamic = "force-dynamic";
const LIST = "/dashboard/activities";

export default async function ActivitiesAdmin() {
  await requireAuth(ADMIN_ROLES);
  const supabase = createAdminClient();
  const { data } = await supabase.from("activities").select("*").order("sort_order");

  const columns: ColumnDef<any>[] = [
    { key: "title", label: "Activity", render: (r) => (
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600"><Icon name={r.icon} className="h-5 w-5" /></span>
        <span className="font-semibold text-ink">{r.title}</span>
      </div>
    ) },
    { key: "kind", label: "Type", render: (r) => <Pill tone={r.kind === "indoor" ? "violet" : "green"}>{r.kind}</Pill> },
    { key: "is_published", label: "Status", render: (r) => <Pill tone={r.is_published ? "green" : "gray"}>{r.is_published ? "Published" : "Hidden"}</Pill> },
  ];
  const fields: FieldDef[] = [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "kind", label: "Type", type: "select", required: true, options: [{ value: "indoor", label: "Indoor" }, { value: "outdoor", label: "Outdoor" }] },
    { name: "description", label: "Description", type: "textarea", full: true },
    { name: "icon", label: "Icon", type: "icon" },
    { name: "image_id", label: "Image", type: "media", mediaFolder: "activities" },
    { name: "sort_order", label: "Sort Order", type: "number", defaultValue: 0 },
    { name: "is_published", label: "Published", type: "checkbox", defaultValue: true },
  ];

  return (
    <div>
      <DashHeader title="Activities" description="Indoor and outdoor activities shown on the website." />
      <ResourceTable table="activities" listPath={LIST} rows={data ?? []} columns={columns} fields={fields} title="Activity" addLabel="Add Activity" />
    </div>
  );
}
