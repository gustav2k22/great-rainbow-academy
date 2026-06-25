import Link from "next/link";
import {
  Users, School, FileText, CalendarDays, Mail, MessageSquare, UserCog,
  ArrowUpRight, Inbox,
} from "lucide-react";
import { DashHeader, Panel, StatCard, Pill, EmptyState } from "@/components/dashboard/ui";
import { getCurrentProfile } from "@/lib/auth";
import { getDashboardStats, getRecentAdmissions, getRecentMessages } from "@/features/dashboard/data";
import { ADMISSION_STAGE_TONE } from "@/features/dashboard/labels";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardOverview() {
  const profile = await getCurrentProfile();
  const [stats, admissions, messages] = await Promise.all([
    getDashboardStats(),
    getRecentAdmissions(),
    getRecentMessages(),
  ]);

  const isAdmin = profile?.role === "system_administrator" || profile?.role === "school_administrator";

  const cards = [
    { label: "Active Students", value: stats.students, icon: <Users className="h-6 w-6" />, accent: "#3b82f6", href: "/dashboard/students" },
    { label: "Classes", value: stats.classes, icon: <School className="h-6 w-6" />, accent: "#8b5cf6", href: "/dashboard/classes" },
    { label: "Staff Members", value: stats.staff, icon: <UserCog className="h-6 w-6" />, accent: "#f97316", href: "/dashboard/users" },
    { label: "New Applications", value: stats.admissionsNew, icon: <FileText className="h-6 w-6" />, accent: "#22c55e", href: "/dashboard/admissions" },
    { label: "Published Events", value: stats.events, icon: <CalendarDays className="h-6 w-6" />, accent: "#ef4444", href: "/dashboard/events" },
    { label: "Subscribers", value: stats.subscribers, icon: <Mail className="h-6 w-6" />, accent: "#6366f1", href: "/dashboard/newsletter" },
    { label: "New Messages", value: stats.messagesNew, icon: <MessageSquare className="h-6 w-6" />, accent: "#0ea5e9", href: "/dashboard/messages" },
    { label: "Total Applications", value: stats.applicationsTotal, icon: <Inbox className="h-6 w-6" />, accent: "#a855f7", href: "/dashboard/admissions" },
  ];

  return (
    <div>
      <DashHeader title="Dashboard" description="A snapshot of everything happening at Great Rainbow Academy." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Recent admissions */}
        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">Recent Applications</h2>
            <Link href="/dashboard/admissions" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800">
              View all <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          {admissions.length === 0 ? (
            <EmptyState title="No applications yet" description="New admission applications will appear here." icon={<FileText className="h-6 w-6" />} />
          ) : (
            <ul className="divide-y divide-brand-100">
              {admissions.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{a.child_first_name} {a.child_last_name}</p>
                    <p className="text-xs text-muted">{a.reference} · {a.applying_for || "Not set"} · {formatDate(a.created_at)}</p>
                  </div>
                  <Pill tone={ADMISSION_STAGE_TONE[a.stage] ?? "gray"}>{a.stage.replace(/_/g, " ")}</Pill>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Recent messages */}
        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">Recent Messages</h2>
            <Link href="/dashboard/messages" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800">
              View all <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          {messages.length === 0 ? (
            <EmptyState title="No messages yet" description="Contact form messages will appear here." icon={<MessageSquare className="h-6 w-6" />} />
          ) : (
            <ul className="divide-y divide-brand-100">
              {messages.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{m.name}</p>
                    <p className="truncate text-xs text-muted">{m.subject || "No subject"} · {formatDate(m.created_at)}</p>
                  </div>
                  <Pill tone={m.status === "new" ? "green" : "gray"}>{m.status}</Pill>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {isAdmin && (
        <Panel className="mt-6">
          <h2 className="font-display text-lg font-bold text-ink">Quick Actions</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Add Student", href: "/dashboard/students" },
              { label: "Create Event", href: "/dashboard/events" },
              { label: "Edit Home Page", href: "/dashboard/content" },
              { label: "Manage Gallery", href: "/dashboard/gallery" },
            ].map((q) => (
              <Link key={q.href} href={q.href} className="rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50">
                {q.label} →
              </Link>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
