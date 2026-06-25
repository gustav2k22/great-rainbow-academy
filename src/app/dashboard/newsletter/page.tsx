import { requireAuth, ADMIN_ROLES } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashHeader } from "@/components/dashboard/ui";
import { NewsletterManager } from "@/features/dashboard/newsletter-manager";
import { emailConfigured, smsConfigured } from "@/lib/messaging";

export const dynamic = "force-dynamic";

export default async function NewsletterAdmin() {
  await requireAuth(ADMIN_ROLES);
  const supabase = createAdminClient();
  const [{ data: campaigns }, { data: subscribers }] = await Promise.all([
    supabase.from("newsletters").select("*").order("created_at", { ascending: false }),
    supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <DashHeader title="Newsletter" description="Manage subscribers and send campaigns by email, SMS or both." />
      <NewsletterManager
        campaigns={campaigns ?? []}
        subscribers={subscribers ?? []}
        emailConfigured={emailConfigured()}
        smsConfigured={smsConfigured()}
      />
    </div>
  );
}
