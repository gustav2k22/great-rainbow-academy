import { requireAuth, STAFF_ROLES } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashHeader } from "@/components/dashboard/ui";
import { AdmissionsBoard } from "@/features/dashboard/admissions-board";

export const dynamic = "force-dynamic";

export default async function AdmissionsAdmin() {
  await requireAuth(STAFF_ROLES);
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("admission_applications")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <DashHeader title="Admissions" description="Review and manage admission applications through each stage." />
      <AdmissionsBoard apps={data ?? []} />
    </div>
  );
}
