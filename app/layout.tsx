import type { Metadata } from "next";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/archivo";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  metadataBase: new URL("https://bolexcollector.com"),
  title: {
    default: "Bolex Collector — Classic Movie Cameras and Projectors",
    template: "%s — Bolex Collector",
  },
  description:
    "The digital museum of Paillard-Bolex: cameras, projectors, lenses, accessories, serial numbers and ephemera — a preservation of the original BolexCollector.com.",
  openGraph: {
    siteName: "Bolex Collector",
    type: "website",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Bolex Collector",
  url: "https://bolexcollector.com",
  description:
    "Digital museum and preservation archive of Paillard-Bolex movie cameras, projectors, lenses and accessories.",
} as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-[var(--accent)] focus:text-[var(--bg)] focus:px-4 focus:py-2 focus:text-sm"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1 w-full max-w-6xl mx-auto px-5 sm:px-8">
          {children}
        </main>
        <SiteFooter />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </body>
    </html>
  );
}
