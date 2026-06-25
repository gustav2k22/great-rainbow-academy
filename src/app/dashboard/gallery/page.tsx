import { requireAuth, ADMIN_ROLES } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashHeader, Pill } from "@/components/dashboard/ui";
import { ResourceTable, type FieldDef, type ColumnDef } from "@/features/dashboard/resource-table";
import { GalleryManager } from "@/features/dashboard/gallery-manager";

export const dynamic = "force-dynamic";
const LIST = "/dashboard/gallery";

export default async function GalleryAdmin() {
  await requireAuth(ADMIN_ROLES);
  const supabase = createAdminClient();

  const { data: albumsRaw } = await supabase
    .from("gallery_albums")
    .select("*, cover:cover_id(public_url)")
    .order("sort_order");

  const { data: items } = await supabase
    .from("gallery_items")
    .select("*, media:media_id(public_url, kind)")
    .order("sort_order");

  const albumRows = (albumsRaw ?? []).map((a: any) => ({ ...a, cover_id_preview: a.cover?.public_url ?? null }));
  const albums = (albumsRaw ?? []).map((a: any) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    items: (items ?? []).filter((it: any) => it.album_id === a.id),
  }));

  const columns: ColumnDef<any>[] = [
    { key: "title", label: "Album", render: (r) => <span className="font-semibold text-ink">{r.title}</span> },
    { key: "slug", label: "Slug" },
    { key: "is_published", label: "Status", render: (r) => <Pill tone={r.is_published ? "green" : "gray"}>{r.is_published ? "Published" : "Hidden"}</Pill> },
  ];
  const fields: FieldDef[] = [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "slug", label: "Slug", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea", full: true },
    { name: "cover_id", label: "Cover Image", type: "media", mediaFolder: "gallery" },
    { name: "sort_order", label: "Sort Order", type: "number", defaultValue: 0 },
    { name: "is_published", label: "Published", type: "checkbox", defaultValue: true },
  ];

  return (
    <div className="space-y-8">
      <div>
        <DashHeader title="Gallery Albums" description="Organise your photos and videos into albums." />
        <ResourceTable table="gallery_albums" listPath={LIST} rows={albumRows} columns={columns} fields={fields} title="Album" addLabel="Add Album" />
      </div>
      <div>
        <h2 className="mb-1 font-display text-xl font-extrabold text-ink">Album Media</h2>
        <p className="mb-4 text-sm text-muted">Add or remove images and videos in each album.</p>
        <GalleryManager albums={albums} />
      </div>
    </div>
  );
}
