export const NICHE_SLUGS = ["restaurants"] as const;
export type NicheSlug = (typeof NICHE_SLUGS)[number];
export const isNicheSlug = (slug: string): slug is NicheSlug =>
  NICHE_SLUGS.includes(slug as NicheSlug);