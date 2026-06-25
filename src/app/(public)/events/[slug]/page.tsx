import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, Tag } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Container, Section } from "@/components/ui/primitives";
import { SmartImage } from "@/components/media/smart-image";
import { ButtonLink } from "@/components/ui/button";
import { getEventBySlug } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import { SITE } from "@/lib/constants";

export const revalidate = 120;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const e = await getEventBySlug(slug);
  if (!e) return { title: "Event not found" };
  return {
    title: e.title,
    description: e.summary ?? undefined,
    openGraph: { title: e.title, description: e.summary ?? undefined, images: e.cover?.public_url ? [e.cover.public_url] : undefined },
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = await getEventBySlug(slug);
  if (!e || e.status !== "published") notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.title,
    description: e.summary,
    startDate: e.start_at,
    endDate: e.end_at,
    eventStatus: "https://schema.org/EventScheduled",
    location: { "@type": "Place", name: e.location ?? "Great Rainbow Academy", address: "Olebu-Capito, Accra, Ghana" },
    image: e.cover?.public_url ? [e.cover.public_url] : undefined,
    organizer: { "@type": "Organization", name: SITE.name, url: SITE.url },
  };

  return (
    <>
      <PageHero title={e.title} subtitle={e.summary ?? undefined} breadcrumb={[{ label: "Events", href: "/events" }, { label: e.title, href: `/events/${e.slug}` }]} />
      <Section>
        <Container className="max-w-3xl">
          <Link href="/events" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800">
            <ArrowLeft className="h-4 w-4" /> Back to events
          </Link>

          {e.cover?.public_url && (
            <SmartImage src={e.cover.public_url} alt={e.cover.alt ?? e.title} width={e.cover.width} height={e.cover.height} aspect="16 / 9" className="mb-8" sizes="(max-width:768px) 100vw, 768px" />
          )}

          <div className="mb-6 flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 font-semibold text-brand-600"><Tag className="h-4 w-4" /> {e.category}</span>
            {e.start_at && <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 font-semibold text-brand-600"><CalendarDays className="h-4 w-4" /> {formatDate(e.start_at)}</span>}
            {e.location && <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 font-semibold text-brand-600"><MapPin className="h-4 w-4" /> {e.location}</span>}
          </div>

          <article className="prose-gra space-y-4 text-lg leading-relaxed text-ink/80">
            {(e.body ?? e.summary ?? "").split("\n").filter(Boolean).map((p, i) => (
              <p key={i} className="text-pretty">{p}</p>
            ))}
          </article>

          <div className="mt-10 rounded-3xl bg-brand-50/60 p-8 text-center ring-1 ring-brand-100">
            <h3 className="font-display text-xl font-bold text-ink">Want to be part of our community?</h3>
            <p className="mt-2 text-muted">Admissions are open all year round.</p>
            <ButtonLink href="/admissions" className="mt-5">Apply for Admission</ButtonLink>
          </div>
        </Container>
      </Section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
