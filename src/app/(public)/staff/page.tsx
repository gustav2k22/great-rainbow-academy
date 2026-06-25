import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { Container, Section, SectionHeading } from "@/components/ui/primitives";
import { StaffExplorer } from "@/features/public/staff-explorer";
import { getPageMeta, getStaff } from "@/lib/queries";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const m = await getPageMeta("staff");
  return { title: m?.seo_title ?? "Our Staff", description: m?.seo_description ?? undefined };
}

export default async function StaffPage() {
  const staff = await getStaff();
  const entries = staff.map((s) => ({
    id: s.id,
    full_name: s.full_name,
    position: s.position,
    department: s.department,
    bio: s.bio,
    photo_url: s.photo?.public_url ?? null,
    photo_w: s.photo?.width ?? null,
    photo_h: s.photo?.height ?? null,
    is_leadership: s.is_leadership,
  }));

  return (
    <>
      <PageHero
        title="Our Staff & Leadership"
        subtitle="Meet the dedicated team committed to your child's growth and success."
        breadcrumb={[{ label: "Staff", href: "/staff" }]}
      />
      <Section>
        <Container>
          <SectionHeading eyebrow="Our People" title="The Team Behind Great Rainbow" className="mb-2" />
          <div className="mt-10">
            {entries.length === 0 ? (
              <p className="text-center text-muted">Staff profiles are coming soon.</p>
            ) : (
              <StaffExplorer staff={entries} />
            )}
          </div>
        </Container>
      </Section>
    </>
  );
}
