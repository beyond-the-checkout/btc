const BRAND_BASE = "https://foreverqrs.com";

export const BRAND = {
  name: "ForeverQRs",
  short: "ForeverQRs",
  home: `${BRAND_BASE}/home`,
  pricing: `${BRAND_BASE}/pricing`,
  enterprise: `${BRAND_BASE}/enterprise`,
  helpBase: `${BRAND_BASE}/help`,
  assetsBase: "https://assets.foreverqrs.com",
} as const;

export const brandName = (useShort = false) =>
  useShort ? BRAND.short : BRAND.name;

export const brandUrl = (path: string) => `${BRAND_BASE}${path}`;

export const helpArticle = (slug: string) =>
  `${BRAND.helpBase}/article/${slug}`;

export const asset = (path: string) => `${BRAND.assetsBase}${path}`;
