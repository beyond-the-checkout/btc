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
  pricing: {
    header: "Simple pricing",
    intro:
      "Redirects are forever. Analytics are metered. Here's exactly what you get:",
    tiers: [
      {
        name: "Free",
        price: "$0",
        bullets: [
          "2 dynamic codes/mo",
          "100 tracked scans/mo",
          "30-day analytics",
          "Redirects work forever",
        ],
        ctaLabel: "Create free account",
        ctaHref:
          "https://app.foreverqrs.com/register?next=/onboarding/qr-landing",
        note: "Perfect for a single location with a few QR codes.",
      },
      {
        name: "Base",
        price: "$9.99/month",
        bullets: [
          "10 dynamic codes/mo",
          "10K tracked scans/mo",
          "1-year analytics",
          "Custom domains",
          "QR code folders",
        ],
        ctaLabel: "Start Base",
        ctaHref:
          "https://app.foreverqrs.com/register?next=/onboarding/qr-landing",
        note: "or $8.33/mo billed yearly",
      },
      {
        name: "Business",
        price: "$39.99/month",
        bullets: [
          "50 dynamic codes/mo",
          "100K tracked scans/mo",
          "3-year analytics",
          "Team access (10 users)",
          "Real-time events",
        ],
        ctaLabel: "Contact us",
        ctaHref: "https://app.foreverqrs.com/contact",
        note: "or $33.33/mo billed yearly",
      },
    ],
    belowPricing:
      "Your codes keep redirecting. That never changes. Your analytics event limit adjusts to your new plan. Customers scan the code, they get to your content. Always.",
  },
  cta: {
    title: "Ship packaging you can trust",
    subtitle:
      "No subscription traps. No vendor dependency. Codes that work, forever.",
  },
};
