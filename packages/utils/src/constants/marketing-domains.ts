export const MARKETING_DOMAINS = new Set([
  "chko.sh",
  "foreverqrs.com",
  "localhost:8888",
  "localhost",
]);
export const isMarketingDomain = (host: string): boolean =>
  MARKETING_DOMAINS.has(host);
