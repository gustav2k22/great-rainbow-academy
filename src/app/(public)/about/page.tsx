import type { Metadata } from "next";
import { Eye, Target } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { SmartImage } from "@/components/media/smart-image";
import { Reveal } from "@/components/layout/route-transition";
import { getCoreValues, getPageMeta, getPageSections } from "@/lib/queries";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const m = await getPageMeta("about");
  return { title: m?.seo_title ?? "About Us", description: m?.seo_description ?? undefined };
}

export default async function AboutPage() {
  const [sections, values] = await Promise.all([getPageSections("about"), getCoreValues()]);
  const story = sections.story;
  const vision = sections.vision;
  const mission = sections.mission;

  return (
    <>
      <PageHero
        title="About Great Rainbow Academy"
        subtitle="Established in 2009, committed to raising disciplined and excellent learners."
        breadcrumb={[{ label: "About", href: "/about" }]}
      />

      {/* Story */}
      {story && (
        <Section>
          <Container className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <SmartImage
                src={story.media?.public_url}
                alt={story.media?.alt}
                width={story.media?.width}
                height={story.media?.height}
                aspect="4 / 3"
                sizes="(max-width:1024px) 100vw, 50vw"
              />
            </Reveal>
            <Reveal delay={0.1}>
              <SectionHeading align="left" eyebrow={story.subheading ?? "Our Story"} title={story.heading ?? "Our Story"} />
              <p className="mt-5 leading-relaxed text-muted text-pretty">{story.body}</p>
            </Reveal>
          </Container>
        </Section>
      )}

      {/* Vision + Mission */}
      <Section className="bg-brand-50/40">
        <Container className="grid gap-6 md:grid-cols-2">
          {[
            { s: vision, icon: <Eye className="h-7 w-7" />, fallback: "Our Vision" },
            { s: mission, icon: <Target className="h-7 w-7" />, fallback: "Our Mission" },
          ].map(({ s, icon, fallback }, i) => (
            <Reveal key={fallback} delay={i * 0.1}>
              <div className="h-full rounded-3xl bg-white p-8 shadow-sm ring-1 ring-brand-100">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white">{icon}</span>
                <h3 className="mt-5 font-display text-2xl font-bold text-ink">{s?.heading ?? fallback}</h3>
                <p className="mt-3 leading-relaxed text-muted text-pretty">{s?.body}</p>
              </div>
            </Reveal>
          ))}
        </Container>
      </Section>

      {/* Core values */}
      {values.length > 0 && (
        <Section>
          <Container>
            <SectionHeading eyebrow="What We Stand For" title="Our Core Values" />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {values.map((v, i) => (
                <Reveal key={v.id} delay={i * 0.05}>
                  <div className="flex items-start gap-4 rounded-2xl bg-brand-50/60 p-5 ring-1 ring-brand-100 transition hover:bg-white hover:shadow-md">
                    <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-white text-brand-600 shadow-sm">
                      <Icon name={v.icon} className="h-6 w-6" />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-bold text-ink">{v.title}</h3>
                      <p className="mt-1 text-sm text-muted">{v.description}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
