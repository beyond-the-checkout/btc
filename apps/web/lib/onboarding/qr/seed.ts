/**
 * Shared QR onboarding seed constants and utilities.
 * This module is server-readable (no "use client" directive).
 * Use this for server-side route handlers that need to read the seed cookie.
 */
import type { QRCodeDesign } from "@/ui/modals/link-qr-modal.types";

export const QR_ONBOARDING_SEED_COOKIE = "qr-onboarding-seed";

export type QROnboardingSeed = {
  url: string;
  qrDesign?: QRCodeDesign;
  timestamp: number;
  /** Unique id for idempotency - prevents duplicate link creation on retries */
  id?: string;
};

/**
 * Parse a raw cookie string into a QROnboardingSeed object.
 * Returns null if parsing fails or the value is empty.
 *
 * Note: js-cookie URL-encodes values by default, so we need to
 * decode the value before parsing as JSON.
 */
export function parseQROnboardingSeed(
  raw: string | undefined,
): QROnboardingSeed | null {
  if (!raw) return null;
  try {
    // URL-decode the value first (js-cookie encodes by default)
    const decoded = decodeURIComponent(raw);
    return JSON.parse(decoded) as QROnboardingSeed;
  } catch {
    return null;
  }
}

/**
 * Serialize a QROnboardingSeed object to a JSON string for cookie storage.
 */
export function serializeQROnboardingSeed(seed: QROnboardingSeed): string {
  return JSON.stringify(seed);
}

/**
 * Server-side cookie options for the QR onboarding seed cookie.
 * Must match the options used by the client-side cookie.ts to ensure
 * proper cookie deletion across subdomains.
 *
 * @param hostname - The request hostname (e.g., from req.headers or URL)
 */
export function getServerCookieOptions(hostname: string): {
  domain?: string;
  path: string;
  secure: boolean;
} {
  const isProd = process.env.NODE_ENV === "production";

  // Host-only cookies in local development
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname.endsWith(".localhost")
  ) {
    return {
      path: "/",
      secure: isProd,
    };
  }

  // Cross-subdomain cookie domain from env
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN;
  return {
    path: "/",
    secure: isProd,
    ...(appDomain && { domain: `.${appDomain}` }),
  };
}
