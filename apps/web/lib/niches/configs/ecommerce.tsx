import { NicheConfig } from "../types";

export const ecommerceConfig: NicheConfig = {
  niche: "ecommerce",
  metadata: {
    title: "ForeverQRs for E-commerce — Packaging QR Codes That Never Expire",
    description:
      "Create QR codes for product packaging you can update anytime. No subscription traps. Your codes keep working, even if you cancel. Free to start.",
    ogTitle: "ForeverQRs for E-commerce — QR Codes That Outlive Your Inventory",
    ogDescription:
      "QR codes for product packaging and inserts. Update destinations after shipping. Codes never expire. Even if you cancel.",
  },
  hero: {
    headline: "QR codes on packaging that outlive your inventory.",
    subheadline:
      "Your products ship. Destinations change. The QR codes on your packaging keep working. Even if you cancel.",
    ctaText: "Create your first code",
    belowCtaText: "Free to start, no credit card required.",
  },
  logos: {
    copy: null,
  },
  pain: {
    header: "You've shipped products. Now what happens when...",
    quotes: [
      {
        quote:
          "Mine expired too and the website asked me a payment.\n\nContext: Your inserts are in 10,000 boxes. Your vendor just changed their pricing. Now what?",
        attribution: "Seller who printed before the paywall",
      },
      {
        quote:
          "Dynamic QR Codes stop working when the subscription expires or the platform shuts down.\n\nContext: You shipped inventory six months ago. A subscription lapsed. Customers scan your insert and get... nothing.",
        attribution: "Industry explanation of vendor dependency",
      },
      {
        quote:
          'Sellers want dynamic codes specifically so they can "change the endpoint in the future." But that flexibility comes with dependency on a vendor who might not be there—or might charge more than you budgeted.',
      },
    ],
    conclusion:
      "Printed packaging shouldn't create vendor dependency. The code you paid to print should keep working, forever.",
  },
  solution: {
    header: "ForeverQRs works differently",
    paragraphs: [
      "Most QR services use the same playbook: 1) Offer free or cheap codes to get you started. 2) Wait until your packaging is printed and shipped. 3) Raise prices, change terms, or shut down—and your codes break.",
      "We don't do that.",
      "**Redirects are forever. Analytics are metered.**",
      "Once you create a code with ForeverQRs, the redirect works indefinitely. Cancel your account, downgrade your plan, whatever. The code on your product insert still points where it should.",
      "Analytics events are metered by usage. Pay for the visibility you need. But your codes never stop working just because you changed plans.",
      "**Your codes keep redirecting. Even if you cancel.**",
    ],
  },
  howItWorks: {
    header: "Three steps. No surprises.",
    steps: [
      {
        title: "Create your QR code",
        description:
          "Enter your destination URL. Download the code. Print it on your packaging, inserts, or labels. Static codes are free, unlimited, no account needed.",
      },
      {
        title: "Make it dynamic (optional)",
        description:
          "Want to change where the code points after products have shipped? Create a free account. Update the destination to a new tutorial, a warranty page, or an upsell offer. The printed code stays the same.",
      },
      {
        title: "Track scans (optional)",
        description:
          "Want to know how many customers are scanning? Which SKUs get engagement? What countries? Free includes 100 analytics events per month. Upgrade for more visibility.",
      },
    ],
    ctaText: "Create your first code",
  },
  featuresSectionTitle: "Built for brands that ship",
  features: [
    {
      id: "qr",
      title: "Never expires",
      description:
        "No arbitrary expiration dates. No subscription traps. The code on your packaging works as long as ForeverQRs exists.",
    },
    {
      id: "domains",
      title: "Custom domains",
      description:
        "Use your own domain for branded links. yourbrand.com/setup instead of some random short link on your premium packaging.",
    },
    {
      id: "analytics",
      title: "Real-time analytics",
      description:
        "See scans as they happen. Which SKUs. What countries. Device types. Know what's getting engagement.",
    },
    {
      id: "qr-customization",
      title: "Update anytime",
      description:
        "New tutorial video? Changed your warranty process? Launching an upsell campaign? Update the destination. Products already in customers' hands still work.",
    },
    {
      id: "data-export",
      title: "Bulk management",
      description:
        "Dozens of products? Organize codes with tags and folders. Track by SKU, batch, or campaign.",
    },
    {
      id: "personalization",
      title: "Works with any destination",
      description:
        "Point your QR to Shopify, your own site, a YouTube tutorial, a warranty registration form, a review request—anything. We just handle the redirect.",
    },
  ],
  pricing: {
    header: "Simple pricing for e-commerce",
    intro:
      "Redirects are forever. Analytics are metered. Here's exactly what you get:",
    tiers: [
      {
        name: "Free",
        price: "$0",
        bullets: [
          "Unlimited static QR codes",
          "2 dynamic codes per month",
          "100 analytics events per month",
          "Redirects work forever",
        ],
        ctaLabel: "Create free account",
        ctaHref:
          "https://app.foreverqrs.com/register?next=/onboarding/qr-landing",
        note: "Perfect for: Small brands testing QR on packaging",
      },
      {
        name: "Pro",
        price: "$9.99/month",
        bullets: [
          "Everything in Free",
          "10-25 dynamic codes per month",
          "10,000 analytics events per month",
          "Custom domains",
          "Bulk management",
        ],
        ctaLabel: "Start Pro",
        ctaHref:
          "https://app.foreverqrs.com/register?next=/onboarding/qr-landing",
        note: "Perfect for: Growing brands with multiple SKUs",
      },
      {
        name: "Business",
        price: "$39.99/month",
        bullets: [
          "Everything in Pro",
          "Unlimited dynamic codes",
          "Unlimited analytics events",
          "Team access",
          "API access",
          "Priority support",
        ],
        ctaLabel: "Contact us",
        ctaHref: "https://app.foreverqrs.com/contact",
        note: "Perfect for: Established brands with large catalogs",
      },
    ],
    belowPricing:
      "What happens if I downgrade or cancel? Your codes keep redirecting. Products in customers' hands still work. Your analytics event limit adjusts to your new plan. That's it.",
  },
  faq: {
    header: "Questions from e-commerce brands",
    items: [
      {
        question:
          "What happens to QR codes on shipped products if I stop paying?",
        answer:
          'They keep redirecting. The "forever" promise is about redirects, not analytics. Once a code exists, it works indefinitely, regardless of your plan. Analytics events are metered based on your current plan.',
      },
      {
        question: "Can I change the destination after products have shipped?",
        answer:
          "Yes. That's the whole point of dynamic codes. Log in, update the destination URL, done. Every product you've ever shipped with that code now points to the new page.",
      },
      {
        question: "How do I track which SKU or batch a scan came from?",
        answer:
          "Create separate codes for each SKU or batch, or use our UTM parameters and folder organization. Pro plans include tags and bulk management to keep everything organized.",
      },
      {
        question: "What if I need to manage hundreds of codes?",
        answer:
          "Pro and Business plans include bulk management—organize codes by SKU, product line, or campaign. Update destinations in batches. Export data anytime.",
      },
      {
        question: "What if ForeverQRs shuts down?",
        answer:
          "Fair question. If we ever shut down, we commit to at least 6 months notice and full data exports so you can migrate your redirects. We're built for longevity, but we're honest about the risk.",
      },
      {
        question: "Can I use my own domain?",
        answer:
          "Yes. Connect your domain to ForeverQRs and use it for all your QR redirects. yourbrand.com/setup looks better on premium packaging than a random short link.",
      },
      {
        question: "What about Amazon FBA products?",
        answer:
          "Be careful here. Amazon's policies on where insert QR codes can direct customers are complex and change. We recommend ForeverQRs primarily for Shopify, DTC, and direct sales where you control the customer relationship. If you sell on Amazon, consult their current policy before adding QR codes to inserts.",
      },
      {
        question: "Can I export my data?",
        answer:
          "Yes. Full CSV export of all your codes, destinations, and scan analytics. Your data is yours.",
      },
    ],
  },
  cta: {
    title: "Ship packaging you can trust",
    subtitle:
      "No subscription traps. No vendor dependency. Codes that work, forever.",
    ctaText: "Create your first code",
    belowCtaText:
      'Free to start. No credit card required. No "upgrade or your codes die" emails. Ever.',
  },
};
