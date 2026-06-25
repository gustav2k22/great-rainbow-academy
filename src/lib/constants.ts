import type { UserRole } from "@/lib/types";

export const SITE = {
  name: "Great Rainbow Academy",
  tagline: "The Citadel of Learning",
  motto: "Discipline and Commitment",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};

export const PUBLIC_NAV = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Departments", href: "/departments" },
  { label: "Academics", href: "/academics" },
  { label: "Activities", href: "/activities" },
  { label: "Gallery", href: "/gallery" },
  { label: "Events", href: "/events" },
  { label: "Staff", href: "/staff" },
  { label: "Contact", href: "/contact" },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  system_administrator: "System Administrator",
  school_administrator: "School Administrator",
  teacher: "Teacher",
  staff: "Staff",
  parent: "Parent",
  student: "Student",
};

export const ROLE_BADGE: Record<UserRole, string> = {
  system_administrator: "bg-rainbow-violet/15 text-brand-700",
  school_administrator: "bg-rainbow-blue/15 text-rainbow-blue",
  teacher: "bg-rainbow-green/15 text-rainbow-green",
  staff: "bg-rainbow-orange/15 text-rainbow-orange",
  parent: "bg-rainbow-yellow/20 text-yellow-700",
  student: "bg-slate-100 text-slate-600",
};
