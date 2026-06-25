import { requireAuth, ADMIN_ROLES } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashHeader } from "@/components/dashboard/ui";
import { Icon } from "@/components/ui/icon";
import { ResourceTable, type FieldDef, type ColumnDef } from "@/features/dashboard/resource-table";

export const dynamic = "force-dynamic";
const LIST = "/dashboard/values";

export default async function ValuesAdmin() {
  await requireAuth(ADMIN_ROLES);
  const supabase = createAdminClient();
  const { data } = await supabase.from("core_values").select("*").order("sort_order");

  const columns: ColumnDef<any>[] = [
    { key: "title", label: "Value", render: (r) => (
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600"><Icon name={r.icon} className="h-5 w-5" /></span>
        <span className="font-semibold text-ink">{r.title}</span>
      </div>
    ) },
    { key: "description", label: "Description", render: (r) => <span className="line-clamp-1 text-muted">{r.description}</span> },
    { key: "sort_order", label: "Order" },
  ];
  const fields: FieldDef[] = [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea", full: true },
    { name: "icon", label: "Icon", type: "icon" },
    { name: "sort_order", label: "Sort Order", type: "number", defaultValue: 0 },
  ];

  return (
    <div>
      <DashHeader title="Core Values" description="The values shown on the Home and About pages." />
      <ResourceTable table="core_values" listPath={LIST} rows={data ?? []} columns={columns} fields={fields} title="Core Value" addLabel="Add Value" />
    </div>
  );
}
