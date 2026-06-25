import Link from "next/link";
import { Mail, MapPin, Phone, Globe } from "lucide-react";
import { Container } from "@/components/ui/primitives";
import { NewsletterForm } from "@/features/public/newsletter-form";
import { PUBLIC_NAV } from "@/lib/constants";
import type { SiteSettings } from "@/lib/types";

export function Footer({ settings }: { settings: SiteSettings | null }) {
  const phones = settings?.phones ?? [];
  const social = settings?.social_links ?? {};
  return (
    <footer className="relative mt-auto overflow-hidden bg-ink text-white">
      <div className="h-1.5 w-full rainbow-bar" />
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* brand */}
          <div>
            <div className="flex items-center gap-2.5">
              {settings?.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={settings.logo_url} alt={settings.school_name} className="h-11 w-11 rounded-xl bg-white object-contain p-0.5" />
              ) : (
                <span className="text-2xl">🌈</span>
              )}
              <div>
                <p className="font-display text-lg font-extrabold">Great Rainbow Academy</p>
                <p className="text-xs text-white/60">The Citadel of Learning</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              Providing quality and affordable education for future leaders. Discipline and Commitment.
            </p>
            <div className="mt-5 flex gap-2">
              {Object.entries(social)
                .filter(([, url]) => url)
                .map(([key, url]) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-white/10 p-2.5 transition hover:bg-white/20"
                    aria-label={key}
                  >
                    <Globe className="h-4 w-4" />
                  </a>
                ))}
            </div>
          </div>

          {/* quick links */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/90">Explore</h3>
            <ul className="grid grid-cols-2 gap-2 text-sm text-white/70">
              {PUBLIC_NAV.concat([{ label: "Admissions", href: "/admissions" }]).map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition hover:text-white">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* contact */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/90">Contact</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 flex-none text-brand-300" />
                <span>{settings?.address ?? "Olebu-Capito, Accra, Ghana"}</span>
              </li>
              {phones.slice(0, 2).map((p) => (
                <li key={p} className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 flex-none text-brand-300" />
                  <a href={`tel:${p.replace(/\s/g, "")}`} className="transition hover:text-white">{p}</a>
                </li>
              ))}
              {settings?.email && (
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 flex-none text-brand-300" />
                  <a href={`mailto:${settings.email}`} className="transition hover:text-white">{settings.email}</a>
                </li>
              )}
            </ul>
          </div>

          {/* newsletter */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/90">Newsletter</h3>
            <p className="mb-4 text-sm text-white/70">
              Get school news, events and updates straight to your inbox.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Great Rainbow Academy. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span>Discipline and Commitment</span>
            <span className="text-base">🌈</span>
          </p>
          <Link href="/login" className="transition hover:text-white/80">Staff Portal</Link>
        </Container>
      </div>
    </footer>
  );
}
