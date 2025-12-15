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
export const SHORT_DOMAIN = requireEnv(
  process.env.NEXT_PUBLIC_APP_SHORT_DOMAIN,
  "NEXT_PUBLIC_APP_SHORT_DOMAIN",
);
export const APP_DOMAIN_ENV = requireEnv(
  process.env.NEXT_PUBLIC_APP_DOMAIN,
  "NEXT_PUBLIC_APP_DOMAIN",
);
export const APP_PORT = requireEnv(
  process.env.NEXT_PUBLIC_APP_PORT,
  "NEXT_PUBLIC_APP_PORT",
);

export const APP_DOMAIN = requireEnv(
  process.env.NEXT_PUBLIC_APP_URL,
  "NEXT_PUBLIC_APP_URL",
);

export const APP_HOSTNAMES = new Set([
  `app.${APP_DOMAIN_ENV}`,
  `preview.${APP_DOMAIN_ENV}`,
  `localhost:${APP_PORT}`,
  "localhost",
]);

export const APP_DOMAIN_WITH_NGROK =
  process.env.NEXT_PUBLIC_NGROK_URL ?? APP_DOMAIN;

export const API_HOSTNAMES = new Set([
  `api.${APP_DOMAIN_ENV}`,
  `api-staging.${APP_DOMAIN_ENV}`,
  `api.${SHORT_DOMAIN}`,
  `api.localhost:${APP_PORT}`,
  "api.localhost",
]);

export const API_DOMAIN = requireEnv(
  process.env.NEXT_PUBLIC_API_URL,
  "NEXT_PUBLIC_API_URL",
);

export const ADMIN_HOSTNAMES = new Set([
  `admin.${APP_DOMAIN_ENV}`,
  `admin.localhost:${APP_PORT}`,
  "admin.localhost",
]);

export const PARTNERS_HOSTNAMES = new Set([
  `partners.${APP_DOMAIN_ENV}`,
  `partners-staging.${APP_DOMAIN_ENV}`,
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

// Checkout domain constants
export const CHECKOUT_DOMAIN = "chko.sh";
export const CHECKOUT_BASE_URL = "https://chko.sh";
export const CHECKOUT_APP_URL = "https://app.chko.sh";
export const CHECKOUT_PARTNERS_URL = "https://partners.chko.sh";
export const CHECKOUT_HELP_BASE = "https://chko.sh/help";
export const CHECKOUT_DOCS_BASE = "https://chko.sh/docs";
export const CHECKOUT_SUPPORT_EMAIL = "support@chko.sh";

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
