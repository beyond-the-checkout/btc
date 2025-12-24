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

export interface NicheConfig {
  niche: NicheSlug;
  metadata: {
    title: string;
    description: string;
  };
  hero: {
    headline: string;
    subheadline: string;
    ctaText?: string;
  };
  logos: {
    copy?: string | null;
  };
  features?: FeatureOverride[];
  cta: {
    title: string;
    subtitle: string;
  };
}
