import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Container, Section, SectionHeading, Eyebrow } from "@/components/ui/primitives";
import { SmartImage } from "@/components/media/smart-image";
import { Reveal } from "@/components/layout/route-transition";
import { getActivities, getEvents, getPageMeta } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import { ActivitiesExplorer } from "@/features/public/activities-explorer";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const m = await getPageMeta("activities");
  return { title: m?.seo_title ?? "Activities & Events", description: m?.seo_description ?? undefined };
}

export default async function ActivitiesPage() {
  const [activities, events] = await Promise.all([getActivities(), getEvents(3)]);
  const entries = activities.map((a) => ({ id: a.id, title: a.title, kind: a.kind, icon: a.icon }));

  return (
    <>
      <PageHero
        title="Activities & Events"
        subtitle="We build confident, well-rounded learners through a vibrant mix of indoor and outdoor activities."
        breadcrumb={[{ label: "Activities", href: "/activities" }]}
      />

      <Section>
        <Container>
          <ActivitiesExplorer activities={entries} />
        </Container>
      </Section>

      {events.length > 0 && (
        <Section className="bg-brand-50/40">
          <Container>
            <div className="flex flex-col items-center gap-4 text-center">
              <Eyebrow>What&apos;s Happening</Eyebrow>
              <SectionHeading title="Upcoming Events" subtitle="Don't miss out on the latest happenings at Great Rainbow Academy." />
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {events.map((e, i) => (
                <Reveal key={e.id} delay={i * 0.07}>
                  <Link href={`/events/${e.slug}`} className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-brand-100 transition hover:-translate-y-1.5 hover:shadow-xl">
                    <SmartImage src={e.cover?.public_url} alt={e.cover?.alt ?? e.title} width={e.cover?.width} height={e.cover?.height} aspect="16 / 10" rounded={false} sizes="(max-width:768px) 100vw, 33vw" />
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-brand-600">{e.category}</span>
                        {e.start_at && <span className="text-muted">{formatDate(e.start_at)}</span>}
                      </div>
                      <h3 className="mt-3 font-display text-lg font-bold text-ink">{e.title}</h3>
                      <p className="mt-2 flex-1 text-sm text-muted">{e.summary}</p>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                        Read more <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
