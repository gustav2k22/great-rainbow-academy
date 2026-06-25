import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Preloader } from "@/components/layout/preloader";
import { RouteTransition } from "@/components/layout/route-transition";
import { LightboxProvider } from "@/components/media/lightbox";
import { getSiteSettings } from "@/lib/queries";
import { SITE } from "@/lib/constants";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: settings?.school_name ?? SITE.name,
    slogan: settings?.motto ?? SITE.motto,
    url: SITE.url,
    logo: settings?.logo_url ?? undefined,
    email: settings?.email ?? undefined,
    telephone: settings?.phones?.[0],
    address: {
      "@type": "PostalAddress",
      streetAddress: settings?.address ?? "Olebu-Capito",
      addressLocality: "Accra",
      addressCountry: "GH",
    },
  };

  return (
    <LightboxProvider>
      <Preloader logoUrl={settings?.logo_url} schoolName={settings?.school_name ?? SITE.name} />
      <Navbar logoUrl={settings?.logo_url} schoolName={settings?.school_name ?? SITE.name} />
      <main className="flex-1">
        <RouteTransition>{children}</RouteTransition>
      </main>
      <Footer settings={settings} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
    </LightboxProvider>
  );
}
