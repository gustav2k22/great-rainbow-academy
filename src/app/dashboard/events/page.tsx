import { requireAuth, ADMIN_ROLES } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashHeader, Pill } from "@/components/dashboard/ui";
import { ResourceTable, type FieldDef, type ColumnDef } from "@/features/dashboard/resource-table";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
const LIST = "/dashboard/events";

export default async function EventsAdmin() {
  await requireAuth(ADMIN_ROLES);
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("events")
    .select("*, cover:cover_id(public_url)")
    .order("start_at", { ascending: false });
  const rows = (data ?? []).map((r: any) => ({ ...r, cover_id_preview: r.cover?.public_url ?? null }));

  const columns: ColumnDef<any>[] = [
    { key: "title", label: "Event", render: (r) => (
      <div className="flex items-center gap-3">
        {r.cover?.public_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.cover.public_url} alt="" className="h-10 w-14 rounded-lg object-cover" />
        )}
        <div>
          <p className="font-semibold text-ink">{r.title}</p>
          <p className="text-xs text-muted">{r.category}{r.is_featured ? " · Featured" : ""}</p>
        </div>
      </div>
    ) },
    { key: "start_at", label: "Date", render: (r) => formatDate(r.start_at) || "Not set" },
    { key: "status", label: "Status", render: (r) => <Pill tone={r.status === "published" ? "green" : r.status === "draft" ? "orange" : "gray"}>{r.status}</Pill> },
  ];
  const fields: FieldDef[] = [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "slug", label: "Slug", type: "text", required: true, help: "Used in the event URL." },
    { name: "summary", label: "Summary", type: "textarea", full: true },
    { name: "body", label: "Full Description", type: "textarea", full: true },
    { name: "category", label: "Category", type: "text", defaultValue: "General" },
    { name: "location", label: "Location", type: "text" },
    { name: "start_at", label: "Start", type: "datetime" },
    { name: "end_at", label: "End", type: "datetime" },
    { name: "cover_id", label: "Cover Image", type: "media", mediaFolder: "events" },
    { name: "status", label: "Status", type: "select", defaultValue: "published", options: [
      { value: "draft", label: "Draft" }, { value: "published", label: "Published" }, { value: "archived", label: "Archived" },
    ] },
    { name: "is_featured", label: "Featured", type: "checkbox" },
  ];

  return (
    <div>
      <DashHeader title="Events" description="Create and manage events shown on the public Events board." />
      <ResourceTable table="events" listPath={LIST} rows={rows} columns={columns} fields={fields} title="Event" addLabel="Add Event" />
    </div>
  );
}
