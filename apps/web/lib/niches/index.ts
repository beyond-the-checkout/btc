import { isNicheSlug, NicheSlug } from "@dub/utils";

import { NicheConfig } from "./types";
import { restaurantsConfig } from "./configs/restaurants";

export const NICHE_CONFIGS = new Map<NicheSlug, NicheConfig>([
  ["restaurants", restaurantsConfig],
]);

export const getNicheConfig = (slug: NicheSlug): NicheConfig | undefined =>
  NICHE_CONFIGS.get(slug);

export const hasNicheConfig = (slug: string): slug is NicheSlug =>
  isNicheSlug(slug) && NICHE_CONFIGS.has(slug);

export * from "./types";