export const BRAND = {
  name: "Beyond the Checkout",
  short: "BTC",
  home: "https://chko.sh/home",
  pricing: "https://chko.sh/pricing",
  enterprise: "https://chko.sh/enterprise",
  helpBase: "https://chko.sh/help",
  assetsBase: "https://assets.chko.sh",
} as const;

export const brandName = (useShort = false) =>
  useShort ? BRAND.short : BRAND.name;

export const brandUrl = (path: string) => `https://chko.sh${path}`;

export const helpArticle = (slug: string) =>
  `${BRAND.helpBase}/article/${slug}`;

export const asset = (path: string) => `${BRAND.assetsBase}${path}`;