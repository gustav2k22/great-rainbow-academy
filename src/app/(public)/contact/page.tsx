import type { Metadata } from "next";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Container, Section } from "@/components/ui/primitives";
import { Reveal } from "@/components/layout/route-transition";
import { ContactForm } from "@/features/public/contact-form";
import { getPageMeta, getSiteSettings } from "@/lib/queries";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const m = await getPageMeta("contact");
  return { title: m?.seo_title ?? "Contact Us", description: m?.seo_description ?? undefined };
}

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const phones = settings?.phones ?? [];

  return (
    <>
      <PageHero
        title="Contact Us"
        subtitle="We would love to hear from you. Reach out by phone, email or send us a message."
        breadcrumb={[{ label: "Contact", href: "/contact" }]}
      />

      <Section>
        <Container className="grid gap-10 lg:grid-cols-5">
          {/* info */}
          <Reveal className="lg:col-span-2">
            <div className="space-y-4">
              <InfoCard icon={<MapPin className="h-6 w-6" />} title="Visit Us" lines={[settings?.address ?? "Olebu-Capito, Accra, Ghana"]} />
              <InfoCard icon={<Phone className="h-6 w-6" />} title="Call Us" lines={phones} hrefPrefix="tel:" />
              {settings?.email && (
                <InfoCard icon={<Mail className="h-6 w-6" />} title="Email Us" lines={[settings.email]} hrefPrefix="mailto:" />
              )}
              <InfoCard icon={<Clock className="h-6 w-6" />} title="Office Hours" lines={["Mon - Fri: 7:30am - 4:00pm", "Sat: 8:00am - 12:00pm"]} />
            </div>
          </Reveal>

          {/* form */}
          <Reveal delay={0.1} className="lg:col-span-3">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-brand-100 sm:p-8">
              <h2 className="font-display text-2xl font-bold text-ink">Send a Message</h2>
              <p className="mt-1 text-sm text-muted">We typically respond within one working day.</p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* map */}
      <div className="h-80 w-full">
        <iframe
          title="Great Rainbow Academy location"
          src="https://www.google.com/maps?q=Olebu-Capito,Accra,Ghana&output=embed"
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </>
  );
}

function InfoCard({
  icon,
  title,
  lines,
  hrefPrefix,
}: {
  icon: React.ReactNode;
  title: string;
  lines: string[];
  hrefPrefix?: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-100">
      <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-brand-600 text-white">{icon}</span>
      <div>
        <h3 className="font-display font-bold text-ink">{title}</h3>
        <div className="mt-1 space-y-0.5 text-sm text-muted">
          {lines.map((l) =>
            hrefPrefix ? (
              <a key={l} href={`${hrefPrefix}${l.replace(/\s/g, "")}`} className="block transition hover:text-brand-700">
                {l}
              </a>
            ) : (
              <p key={l}>{l}</p>
            )
          )}
        </div>
      </div>
    </div>
  );
}
