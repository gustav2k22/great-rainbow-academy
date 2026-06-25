import Link from "next/link";
import { cn } from "@/lib/utils";

export function DashHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-brand-100 bg-white p-5 shadow-sm", className)}>{children}</div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  accent = "#7c3aed",
  href,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  accent?: string;
  href?: string;
  hint?: string;
}) {
  const inner = (
    <div className="group flex items-center gap-4 rounded-2xl border border-brand-100 bg-white p-5 shadow-sm transition hover:shadow-md">
      <span className="grid h-12 w-12 flex-none place-items-center rounded-xl text-white" style={{ background: accent }}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm text-muted">{label}</p>
        <p className="font-display text-2xl font-extrabold text-ink">{value}</p>
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export function EmptyState({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-brand-50/40 px-6 py-16 text-center">
      {icon && <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-white text-brand-500 shadow-sm">{icon}</div>}
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

const PILL: Record<string, string> = {
  green: "bg-rainbow-green/15 text-green-700",
  red: "bg-rainbow-red/15 text-red-700",
  blue: "bg-rainbow-blue/15 text-blue-700",
  orange: "bg-rainbow-orange/15 text-orange-700",
  violet: "bg-brand-100 text-brand-700",
  gray: "bg-slate-100 text-slate-600",
  yellow: "bg-rainbow-yellow/20 text-yellow-700",
};

export function Pill({ tone = "gray", children }: { tone?: keyof typeof PILL; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold capitalize", PILL[tone])}>
      {children}
    </span>
  );
}

export function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">{children}</table>
      </div>
    </div>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={cn("whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted", className)}>{children}</th>;
}

export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("whitespace-nowrap px-4 py-3 align-middle text-ink/90", className)}>{children}</td>;
}
