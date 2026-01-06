import { APP_DOMAIN_ENV, APP_PORT } from "./main";

// Read aliases from env (same as hostname sets in main.ts)
const APP_DOMAIN_ALIASES = (process.env.NEXT_PUBLIC_APP_DOMAIN_ALIASES ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Marketing domains serve the marketing site (/, /pricing, /help, etc.)
export const MARKETING_DOMAINS = new Set([
  APP_DOMAIN_ENV, // Primary (foreverqrs.com)
  ...APP_DOMAIN_ALIASES, // Legacy (chko.sh)
  "localhost",
  `localhost:${APP_PORT}`,
]);

export const isMarketingDomain = (host: string): boolean => {
  // Normalize host by stripping port suffix (e.g., "foreverqrs.com:443" -> "foreverqrs.com")
  // This handles reverse proxy setups that may include ports in the forwarded host
  const normalizedHost = host.split(":")[0];
  return MARKETING_DOMAINS.has(host) || MARKETING_DOMAINS.has(normalizedHost);
};
