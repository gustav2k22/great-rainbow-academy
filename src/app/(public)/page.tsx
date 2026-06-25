import Link from "next/link";
import { ArrowRight, GraduationCap, Sparkles, Star, Quote } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section, SectionHeading, Eyebrow } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { SmartImage } from "@/components/media/smart-image";
import { Reveal } from "@/components/layout/route-transition";
import { GalleryGrid } from "@/features/gallery/gallery-grid";
import { ProprietressMedia } from "@/features/public/proprietress-media";
import {
  getActivities, getCoreValues, getDepartments, getEvents, getGalleryItems,
  getPageSections, getSiteStats, getTestimonials,
} from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const revalidate = 120;

export default async function HomePage() {
  const [sections, departments, stats, values, activities, gallery, events, testimonials] =
    await Promise.all([
      getPageSections("home"),
      getDepartments(),
      getSiteStats(),
      getCoreValues(),
      getActivities(),
      getGalleryItems("school-life"),
      getEvents(3),
      getTestimonials(),
    ]);

  const hero = sections.hero;
  const welcome = sections.welcome;
  const proprietress = sections.proprietress;
  const cta = sections.cta;
  const heroData = (hero?.data ?? {}) as any;

  return (
    <>
      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white pb-16 pt-12 sm:pb-24 sm:pt-16">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-rainbow-violet/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-40 h-72 w-72 rounded-full bg-rainbow-blue/20 blur-3xl" />
        <Container className="relative grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <Eyebrow>The Citadel of Learning</Eyebrow>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl md:text-6xl text-balance">
              {hero?.heading ?? "Welcome to Great Rainbow Academy"}{" "}
              <span className="text-3xl sm:text-4xl">🌈</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg font-semibold text-brand-700">
              {hero?.subheading ?? "Where Excellence Meets Discipline and Commitment"}
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted text-pretty">
              {hero?.body}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={heroData?.primary_cta?.href ?? "/admissions"} size="lg">
                {heroData?.primary_cta?.label ?? "Apply for Admission"}
                <ArrowRight className="h-5 w-5" />
              </ButtonLink>
              <ButtonLink href={heroData?.secondary_cta?.href ?? "/departments"} size="lg" variant="outline">
                {heroData?.secondary_cta?.label ?? "Explore Programs"}
              </ButtonLink>
            </div>
            <div className="mt-8 flex items-center gap-4 text-sm text-muted">
              <div className="flex -space-x-2">
                {["#ef4444", "#f97316", "#22c55e", "#3b82f6"].map((c) => (
                  <span key={c} className="h-8 w-8 rounded-full border-2 border-white" style={{ background: c }} />
                ))}
              </div>
              <span>Trusted by families across Accra since 2009</span>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="relative">
            <div className="relative">
              <SmartImage
                src={hero?.media?.public_url}
                alt={hero?.media?.alt ?? "Great Rainbow Academy students"}
                width={hero?.media?.width}
                height={hero?.media?.height}
                aspect="4 / 5"
                priority
                className="shadow-[0_30px_80px_-30px_rgba(76,29,149,0.5)]"
                sizes="(max-width:1024px) 100vw, 50vw"
              />
              <div className="absolute -bottom-5 -left-5 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-brand-100">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-rainbow-green/15 text-rainbow-green">
                  <GraduationCap className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-sm font-bold text-ink">Nursery to JHS</p>
                  <p className="text-xs text-muted">Complete basic education</p>
                </div>
              </div>
              <div className="absolute -right-4 top-8 flex items-center gap-2 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-brand-100">
                <Sparkles className="h-5 w-5 text-rainbow-orange" />
                <p className="text-sm font-bold text-ink">Discipline &amp; Care</p>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ===================== STATS ===================== */}
      {stats.length > 0 && (
        <div className="border-y border-brand-100 bg-brand-50/40">
          <Container className="grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.05} className="flex flex-col items-center text-center">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-brand-600 shadow-sm">
                  <Icon name={s.icon} className="h-6 w-6" />
                </span>
                <p className="mt-3 font-display text-3xl font-extrabold text-ink">{s.value}</p>
                <p className="text-sm text-muted">{s.label}</p>
              </Reveal>
            ))}
          </Container>
        </div>
      )}

      {/* ===================== WELCOME ===================== */}
      {welcome && (
        <Section>
          <Container className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal className="order-2 lg:order-1">
              <SmartImage
                src={welcome.media?.public_url}
                alt={welcome.media?.alt}
                width={welcome.media?.width}
                height={welcome.media?.height}
                aspect="3 / 2"
                sizes="(max-width:1024px) 100vw, 50vw"
              />
            </Reveal>
            <Reveal delay={0.1} className="order-1 lg:order-2">
              <SectionHeading
                align="left"
                eyebrow={welcome.subheading ?? "About Us"}
                title={welcome.heading ?? "Quality Education for Future Leaders"}
                subtitle={welcome.body ?? undefined}
              />
              <ButtonLink href="/about" variant="secondary" className="mt-7">
                Read Our Story <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </Reveal>
          </Container>
        </Section>
      )}

      {/* ===================== DEPARTMENTS ===================== */}
      <Section className="bg-gradient-to-b from-white to-brand-50/50">
        <Container>
          <SectionHeading
            eyebrow="Our Departments"
            title="A Pathway for Every Stage"
            subtitle="From early years to Junior High School, we nurture each learner with care and excellence."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {departments.map((d, i) => (
              <Reveal key={d.id} delay={i * 0.06}>
                <Link
                  href="/departments"
                  className="group flex h-full flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-brand-100 transition hover:-translate-y-1.5 hover:shadow-xl"
                >
                  <span
                    className="grid h-14 w-14 place-items-center rounded-2xl text-white shadow-md"
                    style={{ background: d.color ?? "#7c3aed" }}
                  >
                    <Icon name={d.icon} className="h-7 w-7" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-bold text-ink">{d.name}</h3>
                  <p className="mt-1 text-sm font-medium text-brand-600">{d.tagline}</p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{d.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                    Learn more <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ===================== CORE VALUES ===================== */}
      {values.length > 0 && (
        <Section>
          <Container>
            <SectionHeading
              eyebrow="What We Stand For"
              title="Our Core Values"
              subtitle="The principles that shape every Great Rainbow learner."
            />
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

      {/* ===================== PROPRIETRESS ===================== */}
      {proprietress && (
        <Section className="bg-brand-900 text-white">
          <Container className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <ProprietressMedia
                imageUrl={proprietress.media?.public_url}
                videoUrl={(proprietress.data as any)?.video_url}
                name={proprietress.subheading ?? "Mrs. Deborah Asare"}
              />
            </Reveal>
            <Reveal delay={0.1}>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-brand-200">
                <Quote className="h-3.5 w-3.5" /> Message from the Proprietress
              </span>
              <h2 className="mt-5 font-display text-3xl font-extrabold sm:text-4xl">
                {proprietress.subheading ?? "Mrs. Deborah Asare"}
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-white/85 text-pretty">{proprietress.body}</p>
              <p className="mt-6 font-display text-xl font-bold text-brand-200">Mrs. Deborah Asare</p>
              <p className="text-sm text-white/60">Proprietress &amp; Founder</p>
            </Reveal>
          </Container>
        </Section>
      )}

      {/* ===================== ACTIVITIES ===================== */}
      {activities.length > 0 && (
        <Section>
          <Container>
            <SectionHeading
              eyebrow="Beyond the Classroom"
              title="Activities That Build Character"
              subtitle="Indoor and outdoor activities that develop confident, well-rounded learners."
            />
            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {activities.map((a, i) => (
                <Reveal key={a.id} delay={i * 0.04}>
                  <div className="group flex flex-col items-center rounded-2xl border border-brand-100 bg-white p-6 text-center transition hover:-translate-y-1 hover:shadow-lg">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 transition group-hover:scale-110">
                      <Icon name={a.icon} className="h-7 w-7" />
                    </span>
                    <h3 className="mt-4 text-sm font-bold text-ink">{a.title}</h3>
                    <span className="mt-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-500">
                      {a.kind}
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* ===================== GALLERY ===================== */}
      {gallery.length > 0 && (
        <Section className="bg-brand-50/40">
          <Container>
            <SectionHeading
              eyebrow="Gallery"
              title="Life at Great Rainbow Academy"
              subtitle="A glimpse into classrooms, activities, sports and celebrations."
            />
            <div className="mt-10">
              <GalleryGrid
                items={gallery.slice(0, 12).map((g) => ({
                  url: g.media!.public_url,
                  kind: g.media!.kind,
                  alt: g.media!.alt,
                  caption: g.caption ?? g.media!.title,
                  width: g.media!.width,
                  height: g.media!.height,
                }))}
              />
            </div>
            <div className="mt-10 text-center">
              <ButtonLink href="/gallery" variant="outline">
                View Full Gallery <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          </Container>
        </Section>
      )}

      {/* ===================== EVENTS ===================== */}
      {events.length > 0 && (
        <Section>
          <Container>
            <SectionHeading
              eyebrow="What's Happening"
              title="Upcoming Events"
              subtitle="Stay up to date with happenings at Great Rainbow Academy."
            />
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {events.map((e, i) => (
                <Reveal key={e.id} delay={i * 0.07}>
                  <Link
                    href={`/events/${e.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-brand-100 transition hover:-translate-y-1.5 hover:shadow-xl"
                  >
                    <SmartImage
                      src={e.cover?.public_url}
                      alt={e.cover?.alt ?? e.title}
                      width={e.cover?.width}
                      height={e.cover?.height}
                      aspect="16 / 10"
                      rounded={false}
                      sizes="(max-width:768px) 100vw, 33vw"
                    />
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

      {/* ===================== TESTIMONIALS ===================== */}
      {testimonials.length > 0 && (
        <Section className="bg-gradient-to-b from-brand-50/50 to-white">
          <Container>
            <SectionHeading eyebrow="Kind Words" title="What Parents Say" />
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <Reveal key={t.id} delay={i * 0.07}>
                  <figure className="flex h-full flex-col rounded-3xl bg-white p-7 shadow-sm ring-1 ring-brand-100">
                    <div className="flex gap-0.5 text-rainbow-yellow">
                      {Array.from({ length: t.rating ?? 5 }).map((_, k) => (
                        <Star key={k} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink/80">
                      “{t.quote}”
                    </blockquote>
                    <figcaption className="mt-5">
                      <p className="font-display font-bold text-ink">{t.author}</p>
                      <p className="text-xs text-muted">{t.role}</p>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* ===================== CTA ===================== */}
      <Section>
        <Container>
          <div className="relative overflow-hidden rounded-[2rem] bg-brand-700 px-8 py-16 text-center text-white sm:px-16">
            <div className="pointer-events-none absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 20% 20%, #fff, transparent 40%), radial-gradient(circle at 80% 80%, #fff, transparent 40%)" }} />
            <div className="relative">
              <h2 className="font-display text-3xl font-extrabold sm:text-4xl text-balance">
                {cta?.heading ?? "Ready to Join the Rainbow Family?"}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-white/85 text-pretty">{cta?.body}</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <ButtonLink href="/admissions" size="lg" variant="white">
                  Start Admission <ArrowRight className="h-5 w-5" />
                </ButtonLink>
                <ButtonLink href="/contact" size="lg" variant="ghost" className="text-white hover:bg-white/10">
                  Contact Us
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
