import { NicheConfig } from "../types";

export const restaurantsConfig: NicheConfig = {
  niche: "restaurants",
  metadata: {
    title: "QR Codes for Restaurants",
    description:
      "Dynamic QR codes for menus, table tents, and promotions. Update your menu anytime without reprinting.",
  },
  hero: {
    headline: "QR Codes Built for Restaurants",
    subheadline:
      "Update your menu anytime. Track what customers scan. No reprinting required.",
    ctaText: "Create Your Menu QR",
  },
  logos: {
    copy: null,
  },
  features: [
    {
      id: "qr",
      title: "Update Menus Instantly",
      description:
        "Swap in seasonal menus or daily specials without reprinting. Keep table tents and stickers current with a single update.",
    },
    {
      id: "analytics",
      title: "Know What Customers Scan",
      description:
        "See which menu sections get the most scans so you can highlight bestsellers and optimize your placements.",
    },
    {
      id: "qr-customization",
      description:
        "Match your restaurant’s branding with custom colors, frames, and logos so every menu scan feels on-brand.",
    },
  ],
  cta: {
    title: "Ready to modernize your menu?",
    subtitle:
      "Create QR codes that grow with your restaurant. Update anytime, track everything.",
  },
};