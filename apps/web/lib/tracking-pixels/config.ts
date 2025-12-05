/**
 * Tracking Pixels - Configuration
 *
 * Centralized configuration for tracking pixel vendors.
 * Currently supports Google Ads only. Extensible for future vendors.
 */

import type { ConversionEventType, TrackingPixelConfig } from "./types";

/** Google Ads Measurement ID - only set this env var in production */
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

/** Google Ads Conversion Labels by event type */
export const GOOGLE_CONVERSION_LABEL_LEAD =
  process.env.NEXT_PUBLIC_GOOGLE_CONVERSION_LABEL_LEAD;
export const GOOGLE_CONVERSION_LABEL_PURCHASE =
  process.env.NEXT_PUBLIC_GOOGLE_CONVERSION_LABEL_PURCHASE;

// =============================================================================
// FUTURE VENDOR IDS (uncomment when implementing)
// =============================================================================
// export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
// export const LINKEDIN_PARTNER_ID = process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID;
// export const LINKEDIN_CONVERSION_ID = process.env.NEXT_PUBLIC_LINKEDIN_CONVERSION_ID;

/**
 * Get the tracking pixel configuration from environment variables.
 * Vendors without configured IDs will be undefined.
 */
export function getTrackingConfig(): TrackingPixelConfig {
  // Build conversion labels map from env vars
  const conversionLabels: Partial<Record<ConversionEventType, string>> = {};
  if (GOOGLE_CONVERSION_LABEL_LEAD) {
    conversionLabels.lead = GOOGLE_CONVERSION_LABEL_LEAD;
    conversionLabels.signup = GOOGLE_CONVERSION_LABEL_LEAD; // signup also uses lead label
  }
  if (GOOGLE_CONVERSION_LABEL_PURCHASE) {
    conversionLabels.purchase = GOOGLE_CONVERSION_LABEL_PURCHASE;
  }

  return {
    google: GOOGLE_ADS_ID
      ? {
          measurementId: GOOGLE_ADS_ID,
          conversionLabels:
            Object.keys(conversionLabels).length > 0
              ? conversionLabels
              : undefined,
        }
      : undefined,

    // Future vendors (uncomment when implementing):
    // meta: META_PIXEL_ID ? { pixelId: META_PIXEL_ID } : undefined,
    // linkedin: LINKEDIN_PARTNER_ID
    //   ? {
    //       partnerId: LINKEDIN_PARTNER_ID,
    //       conversionId: LINKEDIN_CONVERSION_ID
    //         ? parseInt(LINKEDIN_CONVERSION_ID, 10)
    //         : undefined,
    //     }
    //   : undefined,

    debug: process.env.NODE_ENV === "development",
  };
}

/** Check if Google Ads tracking is configured */
export function hasTrackingEnabled(): boolean {
  return !!GOOGLE_ADS_ID;
}
