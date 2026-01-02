import { NicheSlug } from "@dub/utils";
import { ReactNode } from "react";

export type FeatureCardId =
  | "analytics"
  | "domains"
  | "personalization"
  | "qr"
  | "qr-customization"
  | "data-export";

export type FeatureOverride = {
  id: FeatureCardId;
  title?: string;
  description?: string;
  graphic?: ReactNode;
};

export type PainQuote = {
  quote: string;
  attribution?: string;
};

export type PainSection = {
  header: string;
  intro?: string;
  quotes: PainQuote[];
  conclusion?: string;
};

export type SolutionSection = {
  header: string;
  paragraphs?: string[];
};

export type HowItWorksStep = {
  title: string;
  description: string;
};

export type HowItWorksSection = {
  header: string;
  steps: HowItWorksStep[];
  ctaText?: string;
};

export type PricingTier = {
  name: string;
  price: string;
  bullets: string[];
  ctaLabel: string;
  ctaHref: string;
  note?: string;
};

export type PricingSection = {
  header: string;
  intro?: string;
  tiers: PricingTier[];
  belowPricing?: string;
};

export type FAQItem = {
  question: string;
  answer: string;
};

export type FAQSection = {
  header: string;
  items: FAQItem[];
};

export interface NicheConfig {
  niche: NicheSlug;
  metadata: {
    title: string;
    description: string;
    ogTitle?: string;
    ogDescription?: string;
  };
  hero: {
    headline: string;
    subheadline: string;
    ctaText?: string;
    belowCtaText?: string;
  };
  logos: {
    copy?: string | null;
  };
  features?: FeatureOverride[];
  featuresSectionTitle?: string;
  pain?: PainSection;
  solution?: SolutionSection;
  howItWorks?: HowItWorksSection;
  pricing?: PricingSection;
  faq?: FAQSection;
  cta: {
    title: string;
    subtitle: string;
    ctaText?: string;
    belowCtaText?: string;
  };
}
