"use client";

import Link from "next/link";
import { useState } from "react";
import { ExternalLink, Menu } from "lucide-react";
import { Sidebar } from "./sidebar";
import { ROLE_BADGE, ROLE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

export function DashboardShell({
  profile,
  logoUrl,
  children,
}: {
  profile: Profile;
  logoUrl?: string | null;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const firstName = profile.full_name.split(" ")[0] || "there";

  return (
    <div className="flex min-h-screen bg-brand-50/40">
      <Sidebar profile={profile} open={open} onClose={() => setOpen(false)} logoUrl={logoUrl} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 flex-none items-center gap-3 border-b border-brand-100 bg-white/80 px-4 backdrop-blur sm:px-6">
          <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-ink hover:bg-brand-50 lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">Welcome back, {firstName} 👋</p>
            <p className="hidden text-xs text-muted sm:block">Here is what is happening at Great Rainbow Academy.</p>
          </div>
          <span className={cn("hidden rounded-full px-3 py-1 text-xs font-bold sm:inline-flex", ROLE_BADGE[profile.role])}>
            {ROLE_LABELS[profile.role]}
          </span>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            <ExternalLink className="h-3.5 w-3.5" /> <span className="hidden sm:inline">View Website</span>
          </Link>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
