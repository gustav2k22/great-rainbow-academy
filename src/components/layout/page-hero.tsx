import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/primitives";

export function PageHero({
  title,
  subtitle,
  breadcrumb,
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: { label: string; href: string }[];
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-700 to-brand-900 py-16 text-white sm:py-20">
      <div className="pointer-events-none absolute inset-0 opacity-25" style={{ background: "radial-gradient(circle at 15% 20%, #fff, transparent 35%), radial-gradient(circle at 85% 70%, #fff, transparent 35%)" }} />
      <div className="pointer-events-none absolute -bottom-px left-0 h-1.5 w-full rainbow-bar" />
      <Container className="relative text-center">
        <nav className="mb-4 flex items-center justify-center gap-1.5 text-sm text-white/70">
          <Link href="/" className="transition hover:text-white">Home</Link>
          {breadcrumb?.map((b) => (
            <span key={b.href} className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href={b.href} className="transition hover:text-white">{b.label}</Link>
            </span>
          ))}
        </nav>
        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl text-balance">{title}</h1>
        {subtitle && <p className="mx-auto mt-4 max-w-2xl text-white/85 text-pretty">{subtitle}</p>}
      </Container>
    </section>
  );
}
