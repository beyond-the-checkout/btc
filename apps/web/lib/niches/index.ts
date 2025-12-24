import { isNicheSlug, NicheSlug } from "@dub/utils";

import { ecommerceConfig } from "./configs/ecommerce";
import { restaurantsConfig } from "./configs/restaurants";
import { NicheConfig } from "./types";

export const NICHE_CONFIGS = new Map<NicheSlug, NicheConfig>([
  ["restaurants", restaurantsConfig],
  ["ecommerce", ecommerceConfig],
]);

export const getNicheConfig = (slug: NicheSlug): NicheConfig | undefined =>
  NICHE_CONFIGS.get(slug);

export const hasNicheConfig = (slug: string): slug is NicheSlug =>
  isNicheSlug(slug) && NICHE_CONFIGS.has(slug);

export * from "./types";
