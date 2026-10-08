import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://quracouture.com"),
  title: "Qura Couture · Nikah & Wedding Couture for the Bride and Groom",
  description:
    "Private bridal atelier in Puchong, by appointment only. Custom nikah and wedding couture for the bride and groom, designed as one. Serving Malaysia and Singapore since 2015.",
  openGraph: {
    title: "Qura Couture",
    description: "Nikah & wedding couture for the bride and groom, designed as one.",
    url: "https://quracouture.com",
    siteName: "Qura Couture",
    images: [{ url: "/img/hero-mobile-1080.webp", width: 1080, height: 1615 }],
    locale: "en_MY",
    type: "website",
  },
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
