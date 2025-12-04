/**
 * Tracking Pixels - Configuration
 *
 * Centralized configuration for tracking pixel vendors.
 * Currently supports Google Ads only. Extensible for future vendors.
 */

import type { TrackingPixelConfig } from "./types";

/** Google Ads Measurement ID - only set this env var in production */
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

/** Google Ads Conversion Label (optional) */
export const GOOGLE_CONVERSION_LABEL =
  process.env.NEXT_PUBLIC_GOOGLE_CONVERSION_LABEL;

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
  return {
    google: GOOGLE_ADS_ID
      ? {
          measurementId: GOOGLE_ADS_ID,
          conversionLabel: GOOGLE_CONVERSION_LABEL,
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
