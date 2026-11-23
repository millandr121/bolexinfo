import { VIEW_INIT_SCRIPT } from "@/lib/view-preference";
import { THEME_INIT_SCRIPT } from "@/lib/theme-preference";
import { FEATURED_INIT_SCRIPT } from "@/lib/featured";
import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/archivo";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";
import { SITE } from "@/lib/site";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

/**
 * `viewport-fit: cover` lets the page extend under the notch and home
 * indicator, which is what the safe-area insets in globals.css then account
 * for. Zoom is deliberately left unrestricted — pinch-to-zoom is an
 * accessibility right, and archived scans in particular need it.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  /* One colour, because the site has one default. A device-conditional
     theme colour would paint the browser chrome dark around a light page
     for anyone whose machine is set that way. */
  themeColor: "#f5f1e8",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Bolex Collector · Classic Movie Cameras and Projectors",
    template: "%s · Bolex Collector",
  },
  description:
    "The digital museum of Paillard-Bolex: cameras, projectors, lenses, accessories, serial numbers and ephemera, carrying on the original BolexCollector.com.",
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
  url: SITE.url,
  description:
    "Digital museum and preservation archive of Paillard-Bolex movie cameras, projectors, lenses and accessories.",
} as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/*
       * Runs before the first paint and sets `data-view`, which the stylesheet
       * uses to choose between the preserved site and the modern edition. It
       * is inline and tiny on purpose: decide any later and every desktop
       * visitor sees the modern homepage flash past before the old one
       * replaces it.
       */}
      <script dangerouslySetInnerHTML={{ __html: VIEW_INIT_SCRIPT }} />
      {/* Picks the rotating front-page card, before paint, for the same reason. */}
      <script dangerouslySetInnerHTML={{ __html: FEATURED_INIT_SCRIPT }} />
      {/*
       * Sets the theme before the first paint — the stored choice if there
       * is one, light otherwise. Deciding after hydration instead would
       * show anyone who has chosen dark a flash of the light page first.
       */}
      <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      {/*
       * Entrance animations start from `opacity: 0` in the server-rendered
       * HTML and are revealed by the client. With scripting unavailable that
       * reveal never happens, so the archive — which is plain documents and
       * photographs, and should outlive any of its JavaScript — would render
       * as a blank page. This restores it.
       */}
      <noscript>
        <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
      </noscript>
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
