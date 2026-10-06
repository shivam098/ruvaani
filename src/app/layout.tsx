import type { Metadata } from "next";
import { DM_Sans, Cormorant_Garamond } from "next/font/google";
import { getProducts } from "@/lib/catalog";
import { isDemoMode, isAnalyticsEnabled, siteUrl } from "@/lib/config";
import { StoreProvider } from "@/components/store-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AnnouncementMarquee } from "@/components/announcement-marquee";
import { getHomepageSettings } from "@/lib/homepage-settings";
import { MobileEnquiry } from "@/components/mobile-enquiry";
import { InteractionAnalytics } from "@/components/interaction-analytics";
import "./globals.css";
import "./redesign.css";

const sans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const serif = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "RUVAANI | Gifts that create lasting moments", template: "%s | RUVAANI" },
  description: "Thoughtfully crafted, beautifully gifted. Explore RUVAANI's curated corporate hampers, festive keepsakes and custom presentation. Request a personalised quotation.",
  openGraph: { type: "website", siteName: "RUVAANI", locale: "en_IN", images: ["/opengraph-image"] },
  twitter: { card: "summary_large_image" },
  robots: isDemoMode() ? { index: false, follow: false } : { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [products, homepage] = await Promise.all([getProducts(), getHomepageSettings()]);
  const demo = isDemoMode();
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable}`}
    >
      <body>
        <StoreProvider products={products} demo={demo}>
          <a className="skip-link" href="#main-content">Skip to content</a>
          <AnnouncementMarquee announcement={homepage.content.marquee} />
          <SiteHeader />
          <main id="main-content">{children}</main>
          <SiteFooter demo={demo} />
          <MobileEnquiry />
          <InteractionAnalytics enabled={isAnalyticsEnabled()} />
        </StoreProvider>
      </body>
    </html>
  );
}
