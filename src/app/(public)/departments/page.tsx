import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Container, Section } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { SmartImage } from "@/components/media/smart-image";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/layout/route-transition";
import { getDepartments, getPageMeta } from "@/lib/queries";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const m = await getPageMeta("departments");
  return { title: m?.seo_title ?? "Departments", description: m?.seo_description ?? undefined };
}

export default async function DepartmentsPage() {
  const departments = await getDepartments();

  return (
    <>
      <PageHero
        title="Our Departments"
        subtitle="A pathway for every stage, from Nursery to Junior High School."
        breadcrumb={[{ label: "Departments", href: "/departments" }]}
      />
      <Section>
        <Container className="space-y-8">
          {departments.map((d, i) => (
            <Reveal key={d.id} delay={i * 0.05}>
              <div
                className={`grid items-center gap-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-brand-100 sm:p-8 lg:grid-cols-2 ${
                  i % 2 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <SmartImage
                  src={d.image?.public_url}
                  alt={d.image?.alt ?? d.name}
                  width={d.image?.width}
                  height={d.image?.height}
                  aspect="16 / 10"
                  sizes="(max-width:1024px) 100vw, 50vw"
                />
                <div>
                  <span
                    className="grid h-14 w-14 place-items-center rounded-2xl text-white shadow-md"
                    style={{ background: d.color ?? "#7c3aed" }}
                  >
                    <Icon name={d.icon} className="h-7 w-7" />
                  </span>
                  <h2 className="mt-5 font-display text-2xl font-bold text-ink sm:text-3xl">{d.name}</h2>
                  <p className="mt-1 font-semibold text-brand-600">{d.tagline}</p>
                  <p className="mt-4 leading-relaxed text-muted text-pretty">{d.description}</p>
                  <ButtonLink href="/admissions" variant="secondary" className="mt-6">
                    Enroll in {d.name} <ArrowRight className="h-4 w-4" />
                  </ButtonLink>
                </div>
              </div>
            </Reveal>
          ))}
        </Container>
      </Section>
    </>
  );
}
