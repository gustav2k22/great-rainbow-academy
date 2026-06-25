import type { Metadata } from "next";
import { CheckCircle2, FileText } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/layout/route-transition";
import { AdmissionForm } from "@/features/public/admission-form";
import { getDepartments, getPageMeta, getPageSections } from "@/lib/queries";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const m = await getPageMeta("admissions");
  return { title: m?.seo_title ?? "Admissions", description: m?.seo_description ?? undefined };
}

export default async function AdmissionsPage() {
  const [sections, departments] = await Promise.all([getPageSections("admissions"), getDepartments()]);
  const intro = sections.intro;
  const requirements = (sections.requirements?.data?.items ?? []) as string[];
  const steps = (sections.process?.data?.steps ?? []) as { title: string; desc: string }[];
  const levels = departments.map((d) => d.name);

  return (
    <>
      <PageHero
        title={intro?.heading ?? "Admissions"}
        subtitle={intro?.body ?? "We welcome new learners all year round. Our admission process is simple and friendly."}
        breadcrumb={[{ label: "Admissions", href: "/admissions" }]}
      />

      {/* Process steps */}
      {steps.length > 0 && (
        <Section>
          <Container>
            <SectionHeading eyebrow="How It Works" title="Admission Process" />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <Reveal key={s.title} delay={i * 0.07}>
                  <div className="relative h-full rounded-3xl bg-white p-6 shadow-sm ring-1 ring-brand-100">
                    <span className="font-display text-5xl font-extrabold text-brand-100">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="mt-2 font-display text-lg font-bold text-ink">{s.title}</h3>
                    <p className="mt-2 text-sm text-muted">{s.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Requirements + Form */}
      <Section className="bg-brand-50/40">
        <Container className="grid gap-10 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white">
              <FileText className="h-7 w-7" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-bold text-ink">Admission Requirements</h2>
            <p className="mt-2 text-muted">Please have the following ready when you apply.</p>
            <ul className="mt-6 space-y-3">
              {requirements.map((r) => (
                <li key={r} className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-brand-100">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-rainbow-green" />
                  <span className="text-sm font-medium text-ink">{r}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-3">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-brand-100 sm:p-8">
              <h2 className="font-display text-2xl font-bold text-ink">Start Your Application</h2>
              <p className="mt-1 text-sm text-muted">Fill in the form and our team will reach out to guide you.</p>
              <div className="mt-6">
                <AdmissionForm levels={levels} />
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
