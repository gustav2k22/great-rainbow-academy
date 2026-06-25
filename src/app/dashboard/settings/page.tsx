import { requireAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashHeader } from "@/components/dashboard/ui";
import { SettingsTabs } from "@/features/dashboard/settings-tabs";
import { emailConfigured, smsConfigured } from "@/lib/messaging";
import type { SiteSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SettingsAdmin() {
  await requireAuth(["system_administrator"]);
  const supabase = createAdminClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();

  return (
    <div className="max-w-4xl">
      <DashHeader title="Site Settings" description="Branding, contact details, SEO and notification preferences." />
      <SettingsTabs settings={data as SiteSettings} emailConfigured={emailConfigured()} smsConfigured={smsConfigured()} />
    </div>
  );
}
