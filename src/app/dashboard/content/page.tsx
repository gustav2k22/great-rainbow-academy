import { requireAuth, ADMIN_ROLES } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashHeader } from "@/components/dashboard/ui";
import { PageContentEditor } from "@/features/dashboard/page-content-editor";

export const dynamic = "force-dynamic";

export default async function ContentAdmin() {
  await requireAuth(ADMIN_ROLES);
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("page_sections")
    .select("*, media:media_id(public_url)")
    .order("page_slug")
    .order("sort_order");

  const sections = (data ?? []).map((s: any) => ({ ...s, media_preview: s.media?.public_url ?? null }));

  return (
    <div>
      <DashHeader title="Page Content" description="Edit the text and images across your public website pages." />
      <PageContentEditor sections={sections} />
    </div>
  );
}
