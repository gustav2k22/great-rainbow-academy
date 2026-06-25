import { requireAuth, ADMIN_ROLES } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashHeader } from "@/components/dashboard/ui";
import { MediaLibrary } from "@/features/media/media-library";

export const dynamic = "force-dynamic";

export default async function MediaAdmin() {
  await requireAuth(ADMIN_ROLES);
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("media_assets")
    .select("id, public_url, kind, title, alt, caption, folder, width, height")
    .order("created_at", { ascending: false });

  return (
    <div>
      <DashHeader title="Media Library" description="All images and videos are stored in Supabase storage and served with caching." />
      <MediaLibrary items={data ?? []} />
    </div>
  );
}
