import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { SITE } from "@/lib/constants";
import { getSiteSettings } from "@/lib/queries";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings().catch(() => null);
  const title = s?.seo_title || `${SITE.name} | ${SITE.tagline}`;
  const description =
    s?.seo_description ||
    "Great Rainbow Academy provides quality and affordable education from Nursery to JHS in Accra, Ghana.";
  return {
    metadataBase: new URL(SITE.url),
    title: { default: title, template: `%s | ${SITE.name}` },
    description,
    keywords: [
      "Great Rainbow Academy", "school in Accra", "Olebu-Capito school",
      "nursery", "kindergarten", "primary school", "JHS", "Ghana education",
    ],
    applicationName: SITE.name,
    authors: [{ name: SITE.name }],
    openGraph: {
      type: "website",
      siteName: SITE.name,
      title,
      description,
      url: SITE.url,
      images: s?.og_image_url ? [{ url: s.og_image_url, width: 1200, height: 630 }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
    // When an admin uploads a custom favicon use it; otherwise fall back to the
    // generated icon files in src/app (icon.png, apple-icon.png, favicon.ico).
    ...(s?.favicon_url ? { icons: { icon: s.favicon_url } } : {}),
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
