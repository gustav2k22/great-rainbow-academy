import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { Container, Section } from "@/components/ui/primitives";
import { GalleryExplorer } from "@/features/gallery/gallery-explorer";
import { createClient } from "@/lib/supabase/server";
import { getGalleryAlbums, getPageMeta } from "@/lib/queries";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const m = await getPageMeta("gallery");
  return { title: m?.seo_title ?? "Gallery", description: m?.seo_description ?? undefined };
}

export default async function GalleryPage() {
  const supabase = await createClient();
  const [{ data: itemsRaw }, albums] = await Promise.all([
    supabase
      .from("gallery_items")
      .select("caption, sort_order, media:media_id(*), album:album_id(slug, title)")
      .order("sort_order"),
    getGalleryAlbums(),
  ]);

  const items = (itemsRaw ?? [])
    .filter((g: any) => g.media)
    .map((g: any) => ({
      url: g.media.public_url,
      kind: g.media.kind,
      alt: g.media.alt,
      caption: g.caption ?? g.media.title,
      width: g.media.width,
      height: g.media.height,
      albumSlug: g.album?.slug ?? null,
      albumTitle: g.album?.title ?? null,
    }));

  return (
    <>
      <PageHero
        title="Gallery"
        subtitle="Moments from school life: classrooms, activities, sports, graduation and cultural events."
        breadcrumb={[{ label: "Gallery", href: "/gallery" }]}
      />
      <Section>
        <Container>
          <GalleryExplorer items={items} albums={albums.map((a) => ({ slug: a.slug, title: a.title }))} />
        </Container>
      </Section>
    </>
  );
}
