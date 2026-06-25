import { requireAuth, STAFF_ROLES } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashHeader, Pill } from "@/components/dashboard/ui";
import { ResourceTable, type FieldDef, type ColumnDef } from "@/features/dashboard/resource-table";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
const LIST = "/dashboard/announcements";

export default async function AnnouncementsAdmin() {
  await requireAuth(STAFF_ROLES);
  const supabase = createAdminClient();
  const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });

  const columns: ColumnDef<any>[] = [
    { key: "title", label: "Announcement", render: (r) => (
      <div>
        <p className="font-semibold text-ink">{r.is_pinned ? "📌 " : ""}{r.title}</p>
        <p className="line-clamp-1 text-xs text-muted">{r.body}</p>
      </div>
    ) },
    { key: "audience", label: "Audience", render: (r) => <Pill tone="violet">{r.audience}</Pill> },
    { key: "created_at", label: "Created", render: (r) => formatDate(r.created_at) },
  ];
  const fields: FieldDef[] = [
    { name: "title", label: "Title", type: "text", required: true, full: true },
    { name: "body", label: "Message", type: "textarea", required: true, full: true },
    { name: "audience", label: "Audience", type: "select", defaultValue: "all", options: [
      { value: "all", label: "Everyone" }, { value: "staff", label: "Staff" },
      { value: "teachers", label: "Teachers" }, { value: "parents", label: "Parents" },
    ] },
    { name: "is_pinned", label: "Pin to top", type: "checkbox" },
  ];

  return (
    <div>
      <DashHeader title="Announcements" description="Internal announcements for staff and the school community." />
      <ResourceTable table="announcements" listPath={LIST} rows={data ?? []} columns={columns} fields={fields} title="Announcement" addLabel="New Announcement" />
    </div>
  );
}
