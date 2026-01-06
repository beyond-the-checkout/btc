// Helper function to enforce required environment variables
const requireEnv = (value: string | undefined, name: string): string => {
  if (!value) {
    throw new Error(`${name} environment variable is required but not set`);
  }
  return value;
};

export const APP_NAME = requireEnv(
  process.env.NEXT_PUBLIC_APP_NAME,
  "NEXT_PUBLIC_APP_NAME",
);

// Primary short domain (can be flipped via env to foreverqrs.com)
export const SHORT_DOMAIN = requireEnv(
  process.env.NEXT_PUBLIC_APP_SHORT_DOMAIN,
  "NEXT_PUBLIC_APP_SHORT_DOMAIN",
);

// Legacy short domain (must remain stable for backwards compatibility)
// This is used by DefaultDomains.dubsh mapping and must always be "chko.sh"
export const LEGACY_SHORT_DOMAIN =
  process.env.NEXT_PUBLIC_LEGACY_SHORT_DOMAIN ?? "chko.sh";

export const APP_DOMAIN_ENV = requireEnv(
  process.env.NEXT_PUBLIC_APP_DOMAIN,
  "NEXT_PUBLIC_APP_DOMAIN",
);
export const APP_PORT = requireEnv(
  process.env.NEXT_PUBLIC_APP_PORT,
  "NEXT_PUBLIC_APP_PORT",
);

// Read optional aliases from env to keep the allowlist explicit and safe.
// NEXT_PUBLIC_APP_DOMAIN_ALIASES="chko.sh" during migration.
const APP_DOMAIN_ALIASES = (process.env.NEXT_PUBLIC_APP_DOMAIN_ALIASES ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const APP_DOMAIN_ROOTS = [APP_DOMAIN_ENV, ...APP_DOMAIN_ALIASES];

export const APP_DOMAIN = requireEnv(
  process.env.NEXT_PUBLIC_APP_URL,
  "NEXT_PUBLIC_APP_URL",
);

export const APP_HOSTNAMES = new Set([
  // Only app.* and preview.* subdomains - naked domains serve marketing site
  ...APP_DOMAIN_ROOTS.flatMap((root) => [`app.${root}`, `preview.${root}`]),
  `localhost:${APP_PORT}`,
  "localhost",
]);

export const APP_DOMAIN_WITH_NGROK =
  process.env.NEXT_PUBLIC_NGROK_URL ?? APP_DOMAIN;

export const API_HOSTNAMES = new Set([
  ...APP_DOMAIN_ROOTS.flatMap((root) => [`api.${root}`, `api-staging.${root}`]),
  `api.localhost:${APP_PORT}`,
  "api.localhost",
]);

export const API_DOMAIN = requireEnv(
  process.env.NEXT_PUBLIC_API_URL,
  "NEXT_PUBLIC_API_URL",
);

export const ADMIN_HOSTNAMES = new Set([
  ...APP_DOMAIN_ROOTS.map((root) => `admin.${root}`),
  `admin.localhost:${APP_PORT}`,
  "admin.localhost",
]);

export const PARTNERS_HOSTNAMES = new Set([
  ...APP_DOMAIN_ROOTS.flatMap((root) => [
    `partners.${root}`,
    `partners-staging.${root}`,
  ]),
  `partners.localhost:${APP_PORT}`,
  "partners.localhost",
]);

export const PARTNERS_DOMAIN = requireEnv(
  process.env.NEXT_PUBLIC_PARTNERS_URL,
  "NEXT_PUBLIC_PARTNERS_URL",
);

export const PARTNERS_DOMAIN_WITH_NGROK =
  process.env.NEXT_PUBLIC_NGROK_URL ?? PARTNERS_DOMAIN;

export const DUB_LOGO = "https://assets.dub.co/logo.png";
export const DUB_LOGO_SQUARE = "https://assets.dub.co/logo-square.png";
export const DUB_QR_LOGO = "https://assets.chko.sh/assets/checkmark_black.png";
export const DUB_WORDMARK = "https://assets.dub.co/wordmark.png";
export const DUB_THUMBNAIL = "https://assets.dub.co/thumbnail.jpg";

// Checkout brand assets
export const CHECKOUT_WORDMARK = "https://assets.chko.sh/assets/wordmark.png";
export const CHECKOUT_LOGO = "https://assets.chko.sh/assets/logo.png";
export const CHECKOUT_LOGO_SQUARE =
  "https://assets.chko.sh/assets/logo-square.png";
export const CHECKOUT_THUMBNAIL = "https://assets.chko.sh/assets/thumbnail.jpg";
export const CHECKOUT_ASSETS_BASE = "https://assets.chko.sh";

// Checkout domain constants - URLs updated for foreverqrs.com
// Note: Asset URLs (images) remain on assets.chko.sh until CDN migration
export const CHECKOUT_DOMAIN = "foreverqrs.com";
export const CHECKOUT_BASE_URL = "https://foreverqrs.com";
export const CHECKOUT_APP_URL = `https://app.${APP_DOMAIN_ENV}`;
export const CHECKOUT_PARTNERS_URL = `https://partners.${APP_DOMAIN_ENV}`;
export const CHECKOUT_HELP_BASE = "https://foreverqrs.com/help";
export const CHECKOUT_DOCS_BASE = "https://foreverqrs.com/docs";
export const CHECKOUT_SUPPORT_EMAIL = "support@foreverqrs.com";

// The platform workspace ID. Override per environment using BEYONDTC_WORKSPACE_ID.
// We keep DUB_WORKSPACE_ID for backward compatibility across imports.
export const DUB_WORKSPACE_ID = process.env.BEYONDTC_WORKSPACE_ID;
export const BEYONDTC_WORKSPACE_ID = process.env.BEYONDTC_WORKSPACE_ID;
export const ACME_WORKSPACE_ID = "clrei1gld0002vs9mzn93p8ik";
export const ACME_PROGRAM_ID = "prog_CYCu7IMAapjkRpTnr8F1azjN";
export const LEGAL_WORKSPACE_ID = "clrflia0j0000vs7sqfhz9c7q";
export const LEGAL_USER_ID = "clqei1lgc0000vsnzi01pbf47";

// Note: Server-side only env var, not validated at build time
export const R2_URL = process.env.STORAGE_BASE_URL ?? "";
