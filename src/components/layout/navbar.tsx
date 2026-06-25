"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { PUBLIC_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar({ logoUrl, schoolName }: { logoUrl?: string | null; schoolName: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={cn(
        "sticky top-0 z-[100] transition-all duration-300",
        scrolled ? "glass shadow-[0_4px_30px_-12px_rgba(76,29,149,0.25)]" : "bg-white/80"
      )}
    >
      <div className="h-1 w-full rainbow-bar" />
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={schoolName} className="h-10 w-10 rounded-xl object-contain" />
          ) : (
            <span className="text-2xl">🌈</span>
          )}
          <span className="flex flex-col leading-none">
            <span className="font-display text-base font-extrabold text-ink">Great Rainbow</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-500">
              Academy
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-0.5 lg:flex">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
                isActive(item.href) ? "text-brand-700" : "text-ink/70 hover:text-brand-700"
              )}
            >
              {item.label}
              {isActive(item.href) && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 -z-10 rounded-full bg-brand-50"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ButtonLink href="/admissions" size="sm" className="hidden sm:inline-flex">
            Apply Now
          </ButtonLink>
          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-full p-2 text-ink lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-brand-100 bg-white lg:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {PUBLIC_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm font-semibold transition",
                    isActive(item.href) ? "bg-brand-50 text-brand-700" : "text-ink/80 hover:bg-brand-50"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <ButtonLink href="/admissions" className="mt-2">
                Apply for Admission
              </ButtonLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
