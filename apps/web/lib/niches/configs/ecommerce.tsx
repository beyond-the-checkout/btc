import { NicheConfig } from "../types";

export const ecommerceConfig: NicheConfig = {
  niche: "ecommerce",
  metadata: {
    title: "QR Codes for E-commerce",
    description:
      "QR codes for product packaging that you can update anytime. No subscription traps. Your codes keep working, even if you cancel.",
  },
  hero: {
    headline: "QR Codes That Outlive Your Inventory",
    subheadline:
      "Your products ship. Destinations change. The QR codes on your packaging keep working. Even if you cancel.",
    ctaText: "Create Your First Code",
  },
  logos: {
    copy: null,
  },
  features: [
    {
      id: "qr",
      title: "Update After Shipping",
      description:
        "New tutorial video? Changed your warranty process? Update the destination. Products already in customers' hands still work.",
    },
    {
      id: "analytics",
      title: "Track Scans by SKU",
      description:
        "See which products get engagement. Track scans by SKU, batch, or campaign to know what's working.",
    },
    {
      id: "qr-customization",
      description:
        "Use your own domain for branded links. yourbrand.com/setup looks better on premium packaging than a random short link.",
    },
  ],
  cta: {
    title: "Ship packaging you can trust",
    subtitle:
      "No subscription traps. No vendor dependency. Codes that work, forever.",
  },
};
