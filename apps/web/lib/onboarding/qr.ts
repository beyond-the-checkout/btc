import type { ReadonlyURLSearchParams } from "next/navigation";

export const QR_ONBOARDING_SOURCE_PARAM = "source";
export const QR_ONBOARDING_SOURCE_VALUE = "qr-landing";

/**
 * Returns true if the provided source matches the QR-first onboarding value.
 */
export function isQROnboarding(source?: string | null): boolean {
  return source === QR_ONBOARDING_SOURCE_VALUE;
}

/**
 * Safely reads the QR onboarding source from search params.
 */
export function getQROnboardingSource(
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
): string | null {
  return searchParams.get(QR_ONBOARDING_SOURCE_PARAM);
}

/**
 * Appends the QR onboarding source to the provided URLSearchParams object if provided.
 * Returns the same params instance for chaining.
 */
export function appendQROnboardingParam(
  params: URLSearchParams,
  source?: string | null,
): URLSearchParams {
  if (source) {
    params.set(QR_ONBOARDING_SOURCE_PARAM, source);
  }
  return params;
}