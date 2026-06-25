import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/layout/route-transition";
import { getFaqs, getPageMeta, getSubjects } from "@/lib/queries";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const m = await getPageMeta("academics");
  return { title: m?.seo_title ?? "Academics", description: m?.seo_description ?? undefined };
}

export default async function AcademicsPage() {
  const [subjects, faqs] = await Promise.all([getSubjects(), getFaqs()]);

  return (
    <>
      <PageHero
        title="Academics & Subjects"
        subtitle="A rich, balanced curriculum that builds knowledge, skills and character."
        breadcrumb={[{ label: "Academics", href: "/academics" }]}
      />

      <Section>
        <Container>
          <SectionHeading eyebrow="Curriculum" title="Subjects We Offer" subtitle="Our learners study a broad range of subjects across all departments." />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {subjects.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.04}>
                <div className="group flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-100 transition hover:-translate-y-1 hover:shadow-lg">
                  <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                    <Icon name={s.icon} className="h-6 w-6" />
                  </span>
                  <p className="font-semibold text-ink">{s.name}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {faqs.length > 0 && (
        <Section className="bg-brand-50/40">
          <Container className="max-w-3xl">
            <SectionHeading eyebrow="Good to Know" title="Frequently Asked Questions" />
            <div className="mt-10 space-y-3">
              {faqs.map((f, i) => (
                <Reveal key={f.id} delay={i * 0.04}>
                  <details className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-100">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink">
                      {f.question}
                      <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-brand-50 text-brand-600 transition group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{f.answer}</p>
                  </details>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
