import { requireAuth, ADMIN_ROLES } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashHeader, Pill } from "@/components/dashboard/ui";
import { ResourceTable, type FieldDef, type ColumnDef } from "@/features/dashboard/resource-table";
import { initials } from "@/lib/utils";

export const dynamic = "force-dynamic";
const LIST = "/dashboard/staff";

export default async function StaffAdmin() {
  await requireAuth(ADMIN_ROLES);
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("staff_members")
    .select("*, photo:photo_id(public_url)")
    .order("sort_order");
  const rows = (data ?? []).map((r: any) => ({ ...r, photo_id_preview: r.photo?.public_url ?? null }));

  const columns: ColumnDef<any>[] = [
    { key: "full_name", label: "Name", render: (r) => (
      <div className="flex items-center gap-3">
        {r.photo?.public_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.photo.public_url} alt="" className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-600">{initials(r.full_name)}</span>
        )}
        <div>
          <p className="font-semibold text-ink">{r.full_name}</p>
          <p className="text-xs text-muted">{r.position}</p>
        </div>
      </div>
    ) },
    { key: "is_leadership", label: "Group", render: (r) => <Pill tone={r.is_leadership ? "violet" : "gray"}>{r.is_leadership ? "Leadership" : "Team"}</Pill> },
    { key: "is_published", label: "Status", render: (r) => <Pill tone={r.is_published ? "green" : "gray"}>{r.is_published ? "Published" : "Hidden"}</Pill> },
  ];
  const fields: FieldDef[] = [
    { name: "full_name", label: "Full Name", type: "text", required: true },
    { name: "position", label: "Position", type: "text" },
    { name: "department", label: "Department", type: "text" },
    { name: "bio", label: "Bio", type: "textarea", full: true },
    { name: "photo_id", label: "Photo", type: "media", mediaFolder: "staff" },
    { name: "is_leadership", label: "Leadership", type: "checkbox" },
    { name: "sort_order", label: "Sort Order", type: "number", defaultValue: 0 },
    { name: "is_published", label: "Published", type: "checkbox", defaultValue: true },
  ];

  return (
    <div>
      <DashHeader title="Staff Profiles" description="Team members shown on the public Staff page." />
      <ResourceTable table="staff_members" listPath={LIST} rows={rows} columns={columns} fields={fields} title="Staff Member" addLabel="Add Staff" />
    </div>
  );
}
