import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${site.url}/`,
      lastModified: "2026-10-09",
      changeFrequency: "monthly",
      priority: 1,
      images: [`${site.url}/og.jpg`, `${site.url}/img/sketch-photo-1275.webp`, `${site.url}/img/one-couple-1434.webp`],
    },
  ];
}
