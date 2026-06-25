import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { Container, Section } from "@/components/ui/primitives";
import { EventsExplorer } from "@/features/events/events-explorer";
import { getEvents, getPageMeta } from "@/lib/queries";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const m = await getPageMeta("events");
  return { title: m?.seo_title ?? "Events", description: m?.seo_description ?? undefined };
}

export default async function EventsPage() {
  const events = await getEvents();
  const entries = events.map((e) => ({
    id: e.id,
    title: e.title,
    slug: e.slug,
    summary: e.summary,
    category: e.category,
    location: e.location,
    start_at: e.start_at,
    cover_url: e.cover?.public_url ?? null,
    cover_alt: e.cover?.alt ?? null,
    cover_w: e.cover?.width ?? null,
    cover_h: e.cover?.height ?? null,
  }));

  return (
    <>
      <PageHero
        title="Events"
        subtitle="Stay up to date with happenings at Great Rainbow Academy."
        breadcrumb={[{ label: "Events", href: "/events" }]}
      />
      <Section>
        <Container>
          {entries.length === 0 ? (
            <p className="text-center text-muted">No events yet. Please check back soon.</p>
          ) : (
            <EventsExplorer events={entries} />
          )}
        </Container>
      </Section>
    </>
  );
}
