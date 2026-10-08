import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Jost({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

// Kept within what Google displays: ~60 characters for the title, ~155 for the description.
const title = "Custom Nikah & Wedding Outfits, Selangor & JB | Qura Couture";
const description =
  "Bespoke baju nikah and matching Baju Melayu, designed as one for the bride and groom. By appointment in Selangor and Johor Bahru, for Malaysia and Singapore.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title,
  description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Qura Couture · Nikah & wedding couture, designed as one",
    description,
    url: "/",
    siteName: site.name,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Qura Couture: a bride and groom in matching white nikah outfits" }],
    locale: "en_MY",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Qura Couture · Nikah & wedding couture, designed as one",
    description,
    images: ["/og.jpg"],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#faf7f2",
  width: "device-width",
  initialScale: 1,
};

// Runs before first paint: marks JS, and skips the veil intro for repeat visits or reduced motion.
const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');try{if(sessionStorage.getItem('qc-veil')||matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('veil-skip')}}catch(e){d.classList.add('veil-skip')}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
