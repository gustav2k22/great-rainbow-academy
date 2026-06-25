import { requireAuth, ADMIN_ROLES } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashHeader, Pill } from "@/components/dashboard/ui";
import { ResourceTable, type FieldDef, type ColumnDef } from "@/features/dashboard/resource-table";

export const dynamic = "force-dynamic";
const LIST = "/dashboard/testimonials";

export default async function TestimonialsAdmin() {
  await requireAuth(ADMIN_ROLES);
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("testimonials")
    .select("*, photo:photo_id(public_url)")
    .order("sort_order");
  const rows = (data ?? []).map((r: any) => ({ ...r, photo_id_preview: r.photo?.public_url ?? null }));

  const columns: ColumnDef<any>[] = [
    { key: "author", label: "Author", render: (r) => (
      <div>
        <p className="font-semibold text-ink">{r.author}</p>
        <p className="text-xs text-muted">{r.role}</p>
      </div>
    ) },
    { key: "quote", label: "Quote", render: (r) => <span className="line-clamp-1 text-muted">{r.quote}</span> },
    { key: "rating", label: "Rating", render: (r) => <span>{"★".repeat(r.rating ?? 5)}</span> },
    { key: "is_published", label: "Status", render: (r) => <Pill tone={r.is_published ? "green" : "gray"}>{r.is_published ? "Published" : "Hidden"}</Pill> },
  ];
  const fields: FieldDef[] = [
    { name: "author", label: "Author", type: "text", required: true },
    { name: "role", label: "Role", type: "text", placeholder: "Parent, Alumna..." },
    { name: "quote", label: "Quote", type: "textarea", required: true, full: true },
    { name: "rating", label: "Rating (1-5)", type: "number", defaultValue: 5 },
    { name: "photo_id", label: "Photo", type: "media", mediaFolder: "testimonials" },
    { name: "sort_order", label: "Sort Order", type: "number", defaultValue: 0 },
    { name: "is_published", label: "Published", type: "checkbox", defaultValue: true },
  ];

  return (
    <div>
      <DashHeader title="Testimonials" description="Parent and alumni testimonials shown on the Home page." />
      <ResourceTable table="testimonials" listPath={LIST} rows={rows} columns={columns} fields={fields} title="Testimonial" addLabel="Add Testimonial" />
    </div>
  );
}
