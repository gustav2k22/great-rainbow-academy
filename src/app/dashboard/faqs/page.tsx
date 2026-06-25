import { requireAuth, ADMIN_ROLES } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashHeader, Pill } from "@/components/dashboard/ui";
import { ResourceTable, type FieldDef, type ColumnDef } from "@/features/dashboard/resource-table";

export const dynamic = "force-dynamic";
const LIST = "/dashboard/faqs";

export default async function FaqsAdmin() {
  await requireAuth(ADMIN_ROLES);
  const supabase = createAdminClient();
  const { data } = await supabase.from("faqs").select("*").order("sort_order");

  const columns: ColumnDef<any>[] = [
    { key: "question", label: "Question", render: (r) => <span className="font-semibold text-ink">{r.question}</span> },
    { key: "category", label: "Category", render: (r) => <Pill tone="violet">{r.category}</Pill> },
    { key: "is_published", label: "Status", render: (r) => <Pill tone={r.is_published ? "green" : "gray"}>{r.is_published ? "Published" : "Hidden"}</Pill> },
  ];
  const fields: FieldDef[] = [
    { name: "question", label: "Question", type: "text", required: true, full: true },
    { name: "answer", label: "Answer", type: "textarea", required: true, full: true },
    { name: "category", label: "Category", type: "text", defaultValue: "General" },
    { name: "sort_order", label: "Sort Order", type: "number", defaultValue: 0 },
    { name: "is_published", label: "Published", type: "checkbox", defaultValue: true },
  ];

  return (
    <div>
      <DashHeader title="FAQs" description="Frequently asked questions shown on the Academics page." />
      <ResourceTable table="faqs" listPath={LIST} rows={data ?? []} columns={columns} fields={fields} title="FAQ" addLabel="Add FAQ" />
    </div>
  );
}
