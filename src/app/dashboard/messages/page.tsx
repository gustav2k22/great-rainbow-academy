import { requireAuth, STAFF_ROLES, isAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashHeader } from "@/components/dashboard/ui";
import { MessagesInbox } from "@/features/dashboard/messages-inbox";

export const dynamic = "force-dynamic";

export default async function MessagesAdmin() {
  const profile = await requireAuth(STAFF_ROLES);
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <DashHeader title="Messages" description="Enquiries submitted through the website contact form." />
      <MessagesInbox messages={data ?? []} canDelete={isAdmin(profile.role)} />
    </div>
  );
}
