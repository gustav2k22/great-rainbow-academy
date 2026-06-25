import type { Metadata } from "next";
import { requireAuth, STAFF_ROLES } from "@/lib/auth";
import { getSiteSettings } from "@/lib/queries";
import { DashboardShell } from "@/features/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAuth(STAFF_ROLES);
  const settings = await getSiteSettings().catch(() => null);

  return (
    <DashboardShell profile={profile} logoUrl={settings?.logo_url}>
      {children}
    </DashboardShell>
  );
}
