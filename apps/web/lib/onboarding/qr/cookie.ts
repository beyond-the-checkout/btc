"use client";

import Cookies, { type CookieAttributes } from "js-cookie";
import {
  parseQROnboardingSeed,
  QR_ONBOARDING_SEED_COOKIE,
  serializeQROnboardingSeed,
  type QROnboardingSeed,
} from "./seed";

// Re-export shared types and constants for backwards compatibility
export {
  parseQROnboardingSeed,
  QR_ONBOARDING_SEED_COOKIE,
  serializeQROnboardingSeed,
  type QROnboardingSeed,
} from "./seed";

function isProd(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Compute a cross-subdomain cookie domain:
 * - localhost/loopback => undefined (host-only cookie)
 * - otherwise, when NEXT_PUBLIC_APP_DOMAIN is set => .${NEXT_PUBLIC_APP_DOMAIN}
 * Works for production, preview, and custom deployments.
 */
function getCookieDomain(): string | undefined {
  try {
    const hostname =
      typeof window !== "undefined" ? window.location.hostname : undefined;

    // Host-only cookies in local development
    if (
      !hostname ||
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]" ||
      hostname.endsWith(".localhost")
    ) {
      return undefined;
    }

    const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN;
    if (appDomain) {
      return `.${appDomain}`;
    }

    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Cross-subdomain cookie options aligned with NextAuth.
 */
export function getCrossSubdomainCookieOptions(): CookieAttributes {
  return {
    path: "/",
    sameSite: "lax",
    secure: isProd(),
    domain: getCookieDomain(),
  };
}

/**
 * Set the onboarding seed cookie, short-lived by default (60 minutes).
 */
export function setQROnboardingSeedCookie(
  seed: QROnboardingSeed,
  ttlMinutes = 60,
): void {
  const opts = getCrossSubdomainCookieOptions();
  const expires = new Date(Date.now() + ttlMinutes * 60_000);
  Cookies.set(QR_ONBOARDING_SEED_COOKIE, serializeQROnboardingSeed(seed), {
    ...opts,
    expires,
  });
}

/**
 * Read and parse the onboarding seed cookie.
 */
export function readQROnboardingSeedCookie(): QROnboardingSeed | null {
  const value = Cookies.get(QR_ONBOARDING_SEED_COOKIE);
  return parseQROnboardingSeed(value);
}

/**
 * Remove the onboarding seed cookie using the same options.
 */
export function clearQROnboardingSeedCookie(): void {
  const opts = getCrossSubdomainCookieOptions();
  Cookies.remove(QR_ONBOARDING_SEED_COOKIE, opts);
}
