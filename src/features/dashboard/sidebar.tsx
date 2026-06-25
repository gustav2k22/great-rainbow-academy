"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity, BookOpen, CalendarDays, ClipboardCheck, FileText, FolderOpen,
  GraduationCap, HelpCircle, Images, Layers, LayoutDashboard, LayoutTemplate,
  LogOut, Mail, Megaphone, MessageSquare, School, Settings, ShieldCheck,
  Sparkles, UserCog, Users, Wallet, X, type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";
import { navForRole } from "./nav";
import { ROLE_LABELS } from "@/lib/constants";
import { logout } from "@/features/auth/actions";
import { cn, initials } from "@/lib/utils";
import type { Profile } from "@/lib/types";

const ICONS: Record<string, ComponentType<LucideProps>> = {
  LayoutDashboard, Users, School, ClipboardCheck, GraduationCap, Wallet, FileText,
  Megaphone, CalendarDays, Mail, MessageSquare, LayoutTemplate, Layers, BookOpen,
  Activity, Sparkles, UserCog, Quote: HelpCircle, HelpCircle, Images, FolderOpen,
  Settings, ShieldCheck,
};

export function Sidebar({
  profile,
  open,
  onClose,
  logoUrl,
}: {
  profile: Profile;
  open: boolean;
  onClose: () => void;
  logoUrl?: string | null;
}) {
  const pathname = usePathname();
  const groups = navForRole(profile.role);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const content = (
    <div className="flex h-full flex-col bg-brand-900 text-white">
      <div className="flex h-16 flex-none items-center justify-between gap-2 border-b border-white/10 px-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo" className="h-9 w-9 rounded-lg bg-white object-contain p-0.5" />
          ) : (
            <span className="text-2xl">🌈</span>
          )}
          <span className="font-display text-sm font-extrabold leading-tight">
            Great Rainbow<br />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-300">Admin Portal</span>
          </span>
        </Link>
        <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/10 lg:hidden" aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="hide-scrollbar flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {groups.map((g) => (
          <div key={g.title}>
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-white/40">{g.title}</p>
            <div className="space-y-0.5">
              {g.items.map((item) => {
                const ItemIcon = ICONS[item.icon] ?? LayoutDashboard;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                      active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {active && (
                      <motion.span layoutId="sidebar-active" className="absolute left-0 top-1/2 h-6 -translate-y-1/2 rounded-r-full" style={{ width: 3, background: "white" }} />
                    )}
                    <ItemIcon className="h-[18px] w-[18px] flex-none" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="flex-none border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
          <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-brand-500 text-sm font-bold">
            {initials(profile.full_name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{profile.full_name}</p>
            <p className="truncate text-[11px] text-white/50">{ROLE_LABELS[profile.role]}</p>
          </div>
          <form action={logout}>
            <button type="submit" className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white" aria-label="Sign out" title="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-72 flex-none lg:block">{content}</aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
