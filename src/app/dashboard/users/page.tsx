import { requireAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashHeader } from "@/components/dashboard/ui";
import { UsersManager } from "@/features/dashboard/users-manager";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function UsersAdmin() {
  const me = await requireAuth(["system_administrator"]);
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .in("role", ["system_administrator", "school_administrator", "teacher", "staff"])
    .order("created_at", { ascending: false });

  return (
    <div>
      <DashHeader title="Users & Roles" description="Manage staff accounts and what each role can access." />
      <UsersManager users={(data as Profile[]) ?? []} meId={me.id} />
    </div>
  );
}
