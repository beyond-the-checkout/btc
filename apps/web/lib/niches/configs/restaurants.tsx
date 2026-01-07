import { NicheConfig } from "../types";

export const restaurantsConfig: NicheConfig = {
  niche: "restaurants",
  metadata: {
    title: "ForeverQRs for Restaurants — Menu QR Codes That Never Expire",
    description:
      "Create QR codes for your restaurant menus that never expire. Update destinations anytime without reprinting. Your codes keep working, even if you cancel.",
    ogTitle: "ForeverQRs — Menu QR Codes That Work Forever",
    ogDescription:
      "QR codes for restaurant menus, table tents, and signage. Update anytime. Never expires. Even if you cancel.",
  },
  hero: {
    headline: "Your menu QR codes work forever. Even if you cancel.",
    subheadline:
      'Create QR codes for your menus, table tents, and signage. Update the destination anytime. No "upgrade or your codes stop working" emails.',
    ctaText: "Create your first menu code",
    belowCtaText: "Free to start. No credit card required.",
  },
  logos: {
    copy: null,
  },
  pain: {
    header: "You've printed the menus. Now what?",
    intro: `You spent money on table tents. Menu inserts. Window signs. They all have QR codes pointing to your menu.

Then your QR provider sends an email:

"Your free trial has ended. Upgrade now or your codes will stop working."

Or worse: they shut down entirely.`,
    quotes: [
      {
        quote:
          "The service we use to host our QR code menus (Spotmenus) is ceasing service at the end of May.",
        attribution: "Restaurant owner, Reddit",
      },
      {
        quote:
          "Only the company you got the QR code from can change it. You need to pay the fee.",
        attribution: "Small business owner, Reddit",
      },
      {
        quote:
          'Learned it\'s "only active for a week" and continuing required "a hefty annual fee," after printed materials were already ordered.',
        attribution: "Business owner, Reddit",
      },
    ],
    conclusion: "That's not how it should work.",
  },
  solution: {
    header: "A different approach",
    paragraphs: [
      "ForeverQRs separates redirects from analytics.",
      "**Redirects are forever.** Once you create a QR code, it keeps redirecting. Cancel your account, downgrade your plan, whatever. Your codes keep working.",
      "**Analytics are metered.** Pay for visibility into scan data based on usage. But your codes never stop working just because you changed plans.",
      'We don\'t send "upgrade or your links die" emails. Ever.',
      "**Your codes keep redirecting. Even if you cancel.**",
    ],
  },
  howItWorks: {
    header: "How it works for restaurants",
    steps: [
      {
        title: "Create your menu QR code",
        description:
          "Enter your menu URL. Could be a PDF, your website, a third-party menu system. Whatever works for you. Download your QR code instantly.",
      },
      {
        title: "Print it once",
        description:
          "Put the code on your table tents, menu inserts, window signs, or business cards. Print as many as you need.",
      },
      {
        title: "Update anytime",
        description:
          "New seasonal menu? Changed your online ordering provider? Just update the destination in ForeverQRs. The printed code stays the same. No reprinting.",
      },
    ],
    ctaText: "Try it now — Create your first menu code in 30 seconds",
  },
  featuresSectionTitle: "Built for restaurants",
  features: [
    {
      id: "qr",
      title: "Update anytime",
      description:
        "Seasonal menu? New specials? Changed your menu host? Update the destination. The printed code stays the same.",
    },
    {
      id: "analytics",
      title: "Real-time analytics",
      description:
        "See scans as they happen. Which table tents get the most scans? Morning vs. evening traffic? Geographic data if you have multiple locations. Base includes 10,000 tracked scans per month.",
    },
    {
      id: "qr-customization",
      description:
        "Use your own destination—PDF, website, Toast, Square, or any menu host. We just handle the redirect so your printed codes keep working.",
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
      "What happens if I cancel or downgrade? Your codes keep redirecting. That never changes. Your analytics event limit adjusts to your new plan. Guests scan the code, they get to your menu. Always.",
  },
  faq: {
    header: "Questions",
    items: [
      {
        question: "What happens to my menu QR codes if I stop paying?",
        answer:
          'They keep redirecting to your menu. The "forever" promise is about redirects, not analytics. Once a code is created, it redirects indefinitely, regardless of your plan. Your guests always get to your menu.',
      },
      {
        question: "Can I use my own domain?",
        answer:
          "Yes. Connect your domain and use it for all your QR redirects. menu.yourrestaurant.com instead of a generic URL.",
      },
      {
        question: "What if ForeverQRs shuts down?",
        answer:
          "Fair question. If we ever shut down, we commit to at least 6 months notice and full data exports so you can migrate your redirects. We're built for longevity, but we're also honest about the risk. It's the same risk as any QR service, but we won't surprise you.",
      },
      {
        question: "Does it work with my menu host (Toast, Square, PDF, etc.)?",
        answer:
          "Yes. ForeverQRs is just a redirect. Point it at any URL: a PDF on your website, your Toast online ordering page, a third-party menu system, or anywhere else. If it has a URL, we can redirect to it.",
      },
      {
        question:
          "Can I change where the code points after I've printed menus?",
        answer:
          "Yes. That's the whole point. Update the destination in ForeverQRs anytime. The printed code stays the same. New menu host? Just update the URL.",
      },
      {
        question: "What's the difference between static and dynamic QR codes?",
        answer:
          "A static code has the destination URL baked in. It works forever but can't be changed after printing. A dynamic code points to a redirect URL we control. You can change where it goes anytime without reprinting table tents or menus.",
      },
      {
        question: "What if I have multiple locations?",
        answer:
          "Pro and Business plans include bulk management. Organize codes by location, menu type, or season. Update destinations across locations in bulk.",
      },
      {
        question: "Do my guests need an app to scan?",
        answer:
          "No. Any smartphone camera can scan QR codes natively. No app required.",
      },
    ],
  },
  cta: {
    title: "Print menu QR codes you can trust",
    subtitle:
      "No ransom emails. No expiration surprises. Your menu codes work forever.",
    ctaText: "Create your first menu code",
    belowCtaText: "Free to start. No credit card required.",
  },
};
