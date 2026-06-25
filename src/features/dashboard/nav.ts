import type { UserRole } from "@/lib/types";

export interface NavItem {
  label: string;
  href: string;
  icon: string; // lucide icon name (resolved in sidebar)
  roles: UserRole[];
}
export interface NavGroup {
  title: string;
  items: NavItem[];
}

const ALL: UserRole[] = ["system_administrator", "school_administrator", "teacher", "staff"];
const ADMIN: UserRole[] = ["system_administrator", "school_administrator"];
const SYS: UserRole[] = ["system_administrator"];
const TEACH: UserRole[] = ["system_administrator", "school_administrator", "teacher"];

export const NAV: NavGroup[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", roles: ALL }],
  },
  {
    title: "School Management",
    items: [
      { label: "Students", href: "/dashboard/students", icon: "Users", roles: TEACH.concat("staff" as UserRole) },
      { label: "Classes", href: "/dashboard/classes", icon: "School", roles: TEACH },
      { label: "Attendance", href: "/dashboard/attendance", icon: "ClipboardCheck", roles: TEACH },
      { label: "Grades", href: "/dashboard/grades", icon: "GraduationCap", roles: TEACH },
      { label: "Fees", href: "/dashboard/fees", icon: "Wallet", roles: ADMIN },
      { label: "Admissions", href: "/dashboard/admissions", icon: "FileText", roles: ALL },
    ],
  },
  {
    title: "Communications",
    items: [
      { label: "Announcements", href: "/dashboard/announcements", icon: "Megaphone", roles: ALL },
      { label: "Events", href: "/dashboard/events", icon: "CalendarDays", roles: ADMIN },
      { label: "Newsletter", href: "/dashboard/newsletter", icon: "Mail", roles: ADMIN },
      { label: "Messages", href: "/dashboard/messages", icon: "MessageSquare", roles: ALL },
    ],
  },
  {
    title: "Website (CMS)",
    items: [
      { label: "Page Content", href: "/dashboard/content", icon: "LayoutTemplate", roles: ADMIN },
      { label: "Departments", href: "/dashboard/departments", icon: "Layers", roles: ADMIN },
      { label: "Subjects", href: "/dashboard/subjects", icon: "BookOpen", roles: ADMIN },
      { label: "Activities", href: "/dashboard/activities", icon: "Activity", roles: ADMIN },
      { label: "Core Values", href: "/dashboard/values", icon: "Sparkles", roles: ADMIN },
      { label: "Staff Profiles", href: "/dashboard/staff", icon: "UserCog", roles: ADMIN },
      { label: "Testimonials", href: "/dashboard/testimonials", icon: "Quote", roles: ADMIN },
      { label: "FAQs", href: "/dashboard/faqs", icon: "HelpCircle", roles: ADMIN },
      { label: "Gallery", href: "/dashboard/gallery", icon: "Images", roles: ADMIN },
      { label: "Media Library", href: "/dashboard/media", icon: "FolderOpen", roles: ADMIN },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "Site Settings", href: "/dashboard/settings", icon: "Settings", roles: SYS },
      { label: "Users & Roles", href: "/dashboard/users", icon: "ShieldCheck", roles: SYS },
    ],
  },
];

export function navForRole(role: UserRole): NavGroup[] {
  return NAV.map((g) => ({ ...g, items: g.items.filter((i) => i.roles.includes(role)) })).filter(
    (g) => g.items.length > 0
  );
}
