// Business details used across the site. Items marked TODO need confirming with Qura.

export const site = {
  name: "Qura Couture",
  url: "https://quracouture.com",
  tagline: "Nikah & wedding couture for the bride and groom, designed as one.",
  location: "Private atelier, Puchong · By appointment only",
  instagram: "https://www.instagram.com/quracouture/",
  // WhatsApp number in international format, without "+"
  whatsapp: "60125131751",
  replyTime: "an hour on working days",
  leadWeeks: 12,
  depositPct: 30,
  // TODO: set a rate (MYR per 1 SGD) to show approximate S$ prices; null hides them
  myrPerSgd: null as number | null,
};

export const packages = [
  {
    id: "essential",
    name: "Essential",
    from: 1599,
    lines: [
      "Custom nikah gown, kurung or dress silhouette",
      "Lace accents and a classic veil",
      "Heavy chiffon, fully lined",
      "Custom Baju Melayu, tailored to complement her",
    ],
    image: "look-window",
  },
  {
    id: "signature",
    name: "Signature",
    from: 2599,
    lines: ["French lace and hand beading", "Lace veil", "Premium chiffon", "Custom Baju Melayu, designed to match"],
    image: "look-lace",
  },
  {
    id: "couture",
    name: "Couture",
    from: 4299,
    lines: [
      "Fully bespoke, designed from a blank page",
      "Premium chiffon and above",
      "Bride and groom styled as one",
      "Priced after consultation",
    ],
    image: "look-cathedral",
  },
] as const;

// Milestones in weeks from consultation. TODO: confirm the timings with Qura.
export const milestones = [
  { key: "consultation", label: "Consultation", note: "We listen, sketch and agree your design.", week: 0 },
  { key: "fabric", label: "Fabric", note: "Lace and fabric chosen together, for both of you.", week: 1 },
  { key: "first", label: "First fitting", note: "Your outfits take shape on you.", week: 6 },
  { key: "final", label: "Final fitting", note: "Every detail perfected.", week: 10 },
  { key: "collection", label: "Collection", note: "Ready, pressed and waiting.", week: 11 },
] as const;

export function whatsappLink(text: string) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function formatRM(n: number) {
  return `RM${n.toLocaleString("en-MY")}`;
}
