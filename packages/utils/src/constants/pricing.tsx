import { INFINITY_NUMBER } from "./misc";

export type PlanFeature = {
  id?: string;
  text: string;
  tooltip?: {
    title: string;
    cta: string;
    href: string;
  };
};

const LEGACY_PRO_PRICE_IDS = [
  "price_1LodNLAlJJEpqkPVQSrt33Lc", // old monthly
  "price_1LodNLAlJJEpqkPVRxUyCQgZ", // old yearly
  "price_1OTcQBAlJJEpqkPViGtGEsbb", // new monthly (test)
  "price_1OYJeBAlJJEpqkPVLjTsjX0E", // new monthly (prod)
  "price_1OTcQBAlJJEpqkPVYlCMqdLL", // new yearly (test)
  "price_1OYJeBAlJJEpqkPVnPGEZeb0", // new yearly (prod)
];

// 2025 pricing - Base Plan (formerly Pro)
export const NEW_BASE_PRICE_IDS = [
  "price_1SQFhAKANfnWIX8CHoDxGlYC", // monthly (prod) - $9.99/month
  "price_1SQFi6KANfnWIX8C4bf0abdo", // yearly (prod) - $99.96/year
  "price_1SQwS7KANfnWIX8CberMoSuD", // monthly (test) - $9.99/month
  "price_1SQwV3KANfnWIX8CgCpiMraG", // yearly (test) - $99.96/year
];

const LEGACY_BUSINESS_PRICE_IDS = [
  "price_1LodLoAlJJEpqkPV9rD0rlNL", // old monthly
  "price_1LodLoAlJJEpqkPVJdwv5zrG", // oldest yearly
  "price_1OZgmnAlJJEpqkPVOj4kV64R", // old yearly
  "price_1OzNlmAlJJEpqkPV7s9HXNAC", // new monthly (test)
  "price_1OzNmXAlJJEpqkPVYO89lTdx", // new yearly (test)
  "price_1OzOFIAlJJEpqkPVJxzc9irl", // new monthly (prod)
  "price_1OzOXMAlJJEpqkPV9ERrjjbw", // new yearly (prod)
];

// 2025 pricing - Business Plan
export const NEW_BUSINESS_PRICE_IDS = [
  "price_1SQFilKANfnWIX8CRDmOVDdZ", // monthly (prod) - $39.99/month
  "price_1SQFjSKANfnWIX8CcKXxYdF5", // yearly (prod) - $399.96/year
  "price_1SQwXtKANfnWIX8CCu6Ycal7", // monthly (test) - $39.99/month
  "price_1SQwY5KANfnWIX8CT2S3WrTC", // yearly (test) - $399.96/year
];

export const PLANS = [
  {
    name: "Free",
    price: {
      monthly: 0,
      yearly: 0,
    },
    limits: {
      codes: 2,
      scans: 100,
      links: 25, // deprecated - use codes
      clicks: 1_000, // deprecated - use scans
      payouts: 0,
      domains: 3,
      tags: 5,
      folders: 0,
      groups: 0,
      networkInvites: 0,
      users: 1,
      ai: 10,
      api: 60,
      retention: "30-day",
    },
    featureTitle: "Get started for free:",
    features: [
      { id: "scans", text: "100 tracked scans/mo" },
      { id: "codes", text: "2 new codes/mo" },
      { id: "retention", text: "30-day analytics retention" },
      { id: "domains", text: "3 domains" },
      { id: "users", text: "1 user" },
      { id: "qr", text: "Basic QR customization" },
    ] as PlanFeature[],
  },
  {
    name: "Base",
    link: "https://chko.dev/help/article/base-plan",
    price: {
      monthly: 9.99,
      yearly: 8.33,
      ids: [...LEGACY_PRO_PRICE_IDS, ...NEW_BASE_PRICE_IDS],
    },
    limits: {
      codes: 10,
      scans: 10_000,
      links: 1_000, // deprecated - use codes
      clicks: 50_000, // deprecated - use scans
      payouts: 0,
      domains: 10,
      tags: 25,
      folders: 3,
      groups: 0,
      networkInvites: 0,
      users: 3,
      ai: 1_000,
      api: 600,
      retention: "1-year",
    },
    featureTitle: "Everything in Free, plus:",
    features: [
      { id: "scans", text: "10K tracked scans/mo" },
      { id: "codes", text: "10 new codes/mo" },
      { id: "retention", text: "1-year analytics retention" },
      { id: "domains", text: "10 domains" },
      { id: "users", text: "3 users" },
      {
        id: "advanced",
        text: "Advanced QR code features",
        tooltip: "ADVANCED_LINK_FEATURES",
      },
      {
        id: "folders",
        text: "QR code folders",
        tooltip: {
          title: "Organize and manage access to your QR codes using folders.",
          cta: "Learn more.",
          href: "https://chko.dev/help/article/qr-code-folders",
        },
      },
    ] as PlanFeature[],
  },
  {
    name: "Business",
    price: {
      monthly: 39.99,
      yearly: 33.33,
      ids: [...LEGACY_BUSINESS_PRICE_IDS, ...NEW_BUSINESS_PRICE_IDS],
    },
    limits: {
      codes: 50,
      scans: 100_000,
      links: 10_000, // deprecated - use codes
      clicks: 250_000, // deprecated - use scans
      payouts: 2_500_00,
      domains: 100,
      tags: INFINITY_NUMBER,
      folders: 20,
      groups: 3,
      networkInvites: 0,
      users: 10,
      ai: 1_000,
      api: 1_200,
      retention: "3-year",
    },
    featureTitle: "Everything in Base, plus:",
    features: [
      {
        id: "scans",
        text: "100K tracked scans/mo",
      },
      {
        id: "codes",
        text: "50 new codes/mo",
      },
      {
        id: "retention",
        text: "3-year analytics retention",
      },
      {
        id: "payouts",
        text: "$2.5K partner payouts/mo",
        tooltip: {
          title:
            "Send payouts to your partners with 1-click (or automate it completely) – all across the world.",
          cta: "Learn more.",
          href: "https://dub.co/help/article/partner-payouts",
        },
      },
      {
        id: "users",
        text: "10 users",
      },
      {
        id: "events",
        text: "Real-time events stream",
        tooltip: {
          title:
            "Get more data on your link clicks and QR code scans with a detailed, real-time stream of events in your workspace",
          cta: "Learn more.",
          href: "https://dub.co/help/article/real-time-events-stream",
        },
      },
      {
        id: "partners",
        text: "Partner management",
        tooltip: {
          title: "Use Dub Partners to manage and pay out your affiliates.",
          cta: "Learn more.",
          href: "https://dub.co/partners",
        },
      },
      {
        id: "tests",
        text: "A/B testing (beta)",
      },
      {
        id: "roles",
        text: "Customer insights",
        tooltip: {
          title:
            "Get real-time insights into your customers' behavior and preferences.",
          cta: "Learn more.",
          href: "https://dub.co/help/article/customer-insights",
        },
      },
      {
        id: "webhooks",
        text: "Event webhooks",
        tooltip: {
          title:
            "Get real-time notifications when a link is clicked or a QR code is scanned using webhooks.",
          cta: "Learn more.",
          href: "https://dub.co/docs/concepts/webhooks/introduction",
        },
      },
    ] as PlanFeature[],
  },
  {
    name: "Advanced",
    price: {
      monthly: 99.99,
      yearly: 83.33,
      ids: [
        "price_1SQFk5KANfnWIX8Cn5PMKBSZ", // monthly (prod) - $99.99/month
        "price_1SQFklKANfnWIX8CdfcD2M53", // yearly (prod) - $999.96/year
        "price_1SQwdlKANfnWIX8Co0YKN7DU", // monthly (test) - $99.99/month
        "price_1SQwdvKANfnWIX8CiJEjWZRc", // yearly (test) - $999.96/year
      ],
    },
    limits: {
      codes: 250,
      scans: 500_000,
      links: 50_000, // deprecated - use codes
      clicks: 1_000_000, // deprecated - use scans
      payouts: 15_000_00,
      domains: 250,
      tags: INFINITY_NUMBER,
      folders: 50,
      groups: 10,
      networkInvites: 0,
      users: 20,
      ai: 1_000,
      api: 3_000,
      retention: "5-year",
    },
    featureTitle: "Everything in Business, plus:",
    features: [
      {
        id: "scans",
        text: "500K tracked scans/mo",
      },
      {
        id: "codes",
        text: "250 new codes/mo",
      },
      {
        id: "retention",
        text: "5-year analytics retention",
      },
      {
        id: "payouts",
        text: "$15K partner payouts/mo",
        tooltip: {
          title:
            "Send payouts to your partners with 1-click (or automate it completely) – all across the world.",
          cta: "Learn more.",
          href: "https://dub.co/help/article/partner-payouts",
        },
      },
      {
        id: "users",
        text: "20 users",
      },
      {
        id: "flexiblerewards",
        text: "Advanced reward structures",
        tooltip: {
          title:
            "Create dynamic click, lead, or sale-based rewards with country and product-specific modifiers.",
          cta: "Learn more.",
          href: "https://dub.co/help/article/partner-rewards",
        },
      },
      {
        id: "embeddedreferrals",
        text: "Embedded referral dashboard",
        tooltip: {
          title:
            "Create an embedded referral dashboard directly in your app in just a few lines of code.",
          cta: "Learn more.",
          href: "https://dub.co/docs/partners/embedded-referrals",
        },
      },
      {
        id: "messages",
        text: "Messaging center",
        tooltip: {
          title:
            "Easily communicate with your partners using our messaging center.",
        },
      },
      {
        id: "api",
        text: "Partners API",
        tooltip: {
          title:
            "Leverage our partners API to build a bespoke, white-labeled referral program that lives within your app.",
          cta: "Learn more.",
          href: "https://dub.co/docs/api-reference/endpoint/create-a-partner",
        },
      },
      {
        id: "slack",
        text: "Priority Slack support",
      },
    ] as PlanFeature[],
  },
  {
    name: "Enterprise",
    price: {
      monthly: null,
      yearly: null,
    },
    limits: {
      links: 500_000,
      clicks: 5_000_000,
      payouts: INFINITY_NUMBER,
      domains: 250,
      tags: INFINITY_NUMBER,
      folders: INFINITY_NUMBER,
      groups: INFINITY_NUMBER,
      networkInvites: 20,
      users: 30,
      ai: 1_000,
      api: 3_000,
      retention: "Unlimited",
    },
  },
];

export const FREE_PLAN = PLANS.find((plan) => plan.name === "Free")!;
export const BASE_PLAN = PLANS.find((plan) => plan.name === "Base")!;
export const PRO_PLAN = BASE_PLAN; // alias for backward compatibility
export const BUSINESS_PLAN = PLANS.find((plan) => plan.name === "Business")!;
export const ADVANCED_PLAN = PLANS.find((plan) => plan.name === "Advanced")!;

export const SELF_SERVE_PAID_PLANS = PLANS.filter((p) =>
  ["Base", "Business", "Advanced"].includes(p.name),
);

/**
 * Normalizes plan IDs for backward compatibility
 * Maps "Pro" to "Base" to handle legacy references
 */
export const normalizePlanId = (plan: string): string => {
  return plan.toLowerCase() === "pro" ? "base" : plan;
};

export const FREE_WORKSPACES_LIMIT = 2;

export const getPlanFromPriceId = (priceId: string) => {
  return PLANS.find((plan) => plan.price.ids?.includes(priceId)) || null;
};

export const getPlanDetails = (plan: string) => {
  const normalizedPlan = normalizePlanId(plan);
  return SELF_SERVE_PAID_PLANS.find(
    (p) => p.name.toLowerCase() === normalizedPlan.toLowerCase(),
  )!;
};

export const getCurrentPlan = (plan: string) => {
  const normalizedPlan = normalizePlanId(plan);
  return (
    PLANS.find((p) => p.name.toLowerCase() === normalizedPlan.toLowerCase()) ||
    FREE_PLAN
  );
};

export const getNextPlan = (plan?: string | null) => {
  if (!plan) return BASE_PLAN;
  const currentPlan = normalizePlanId(plan.toLowerCase().split(" ")[0]); // to account for old Business plans (e.g. "Business Plus") and Pro->Base migration
  return PLANS[
    Math.min(
      // returns the next plan, or the last plan if the current plan is the last plan
      PLANS.findIndex((p) => p.name.toLowerCase() === currentPlan) + 1,
      PLANS.length - 1,
    )
  ];
};

export const isDowngradePlan = (currentPlan: string, newPlan: string) => {
  const normalizedCurrentPlan = normalizePlanId(currentPlan);
  const normalizedNewPlan = normalizePlanId(newPlan);
  const currentPlanIndex = PLANS.findIndex(
    (p) => p.name.toLowerCase() === normalizedCurrentPlan.toLowerCase(),
  );
  const newPlanIndex = PLANS.findIndex(
    (p) => p.name.toLowerCase() === normalizedNewPlan.toLowerCase(),
  );
  return currentPlanIndex > newPlanIndex;
};

export const isLegacyBusinessPlan = ({
  plan = "business",
  payoutsLimit = 0,
}: {
  plan?: string;
  payoutsLimit?: number;
}) => plan === "business" && payoutsLimit === 0;
