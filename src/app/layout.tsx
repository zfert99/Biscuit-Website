import type { Metadata } from "next";
import { Fredoka, Manrope, Space_Mono, Permanent_Marker } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { site, siteJsonLd } from "@/lib/site";

// Self-hosted via next/font — no external requests, no layout shift.
// See Docs/design/design-system.md §2.
const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

// Space Mono is not a variable font, so a weight is required.
const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// The one handwritten face — used only for the single header aside.
const permanentMarker = Permanent_Marker({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-hand",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    url: site.url,
    title: site.name,
    description: site.description,
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${manrope.variable} ${spaceMono.variable} ${permanentMarker.variable}`}
    >
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <JsonLd data={siteJsonLd()} />
        <SiteHeader />
        {children}
        <SiteFooter />
        {/* Vercel Web Analytics (traffic) + Speed Insights (Web Vitals). No-ops
            unless enabled on the project; keep static-page rendering unaffected. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
