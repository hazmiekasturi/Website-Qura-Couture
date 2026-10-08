import { packages, site } from "@/lib/site";

/** schema.org data for Google: the business, its packages and the website. */
export function StructuredData() {
  const business = `${site.url}/#business`;
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ClothingStore",
        "@id": business,
        name: site.name,
        url: site.url,
        logo: `${site.url}/brand/logo-teal.png`,
        image: [`${site.url}/og.jpg`, `${site.url}/img/sketch-photo-1275.webp`, `${site.url}/img/one-couple-1434.webp`],
        description:
          "Private bridal atelier making custom nikah and wedding outfits for the bride and groom, designed as one: baju nikah, wedding gowns and matching Baju Melayu.",
        slogan: "Designed as one.",
        foundingDate: "2015",
        telephone: `+${site.whatsapp}`,
        priceRange: "RM1,599 – RM4,299+",
        currenciesAccepted: "MYR",
        // Puchong stays here (not in visible copy) so nearby searches still find the atelier.
        address: { "@type": "PostalAddress", addressLocality: "Puchong", addressRegion: "Selangor", addressCountry: "MY" },
        areaServed: [
          { "@type": "State", name: "Selangor" },
          { "@type": "City", name: "Kuala Lumpur" },
          { "@type": "City", name: "Cyberjaya" },
          { "@type": "State", name: "Johor" },
          { "@type": "City", name: "Johor Bahru" },
          { "@type": "Country", name: "Singapore" },
        ],
        sameAs: [site.instagram, site.facebook],
        makesOffer: packages.map((p) => ({
          "@type": "Offer",
          name: `${p.name} bride & groom package`,
          description: p.lines.join(". "),
          priceSpecification: { "@type": "PriceSpecification", minPrice: p.from, priceCurrency: "MYR" },
        })),
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        inLanguage: "en-MY",
        publisher: { "@id": business },
      },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
