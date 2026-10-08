import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Qura Couture",
    short_name: "Qura",
    description: "Nikah & wedding couture for the bride and groom, designed as one.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf7f2",
    theme_color: "#1f4f4c",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/brand/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
