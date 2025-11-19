/**
 * Validates if a redirect URL is safe for internal redirects.
 *
 * Note: This utility only checks origin safety. Callers should still ensure
 * redirects are performed only for safe HTTP methods (GET/HEAD) to avoid
 * method-preserving redirects of non-idempotent requests (e.g., POST/RSC).
 */
export function isValidInternalRedirect(
  redirectPath: string,
  currentUrl: string | URL,
): boolean {
  try {
    // Ensure the URL construction results in same-origin redirect
    const redirectUrl = new URL(redirectPath, currentUrl);
    const currentOrigin = new URL(currentUrl).origin;

    return redirectUrl.origin === currentOrigin;
  } catch (error) {
    // Invalid URL construction
    return false;
  }
}
