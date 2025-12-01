/**
 * Tracking Pixels - Type Definitions
 *
 * Extensible type system for multi-vendor conversion tracking.
 * Currently supports Google Ads. Meta/Facebook and LinkedIn can be added later.
 */

/** Supported tracking pixel vendors */
export type TrackingVendor = "google"; // Future: | "meta" | "linkedin"

/** Standard conversion event types */
export type ConversionEventType =
  | "page_view"
  | "lead"
  | "signup"
  | "purchase"
  | "application_submitted"
  | "custom";

/** Base conversion event data */
export interface ConversionEvent {
  /** Event type for semantic mapping across vendors */
  type: ConversionEventType;
  /** Optional custom event name (used when type is 'custom') */
  customEventName?: string;
  /** Event value in currency units */
  value?: number;
  /** Currency code (e.g., 'USD') */
  currency?: string;
  /** Transaction/order ID */
  transactionId?: string;
  /** Additional vendor-specific parameters */
  params?: Record<string, unknown>;
}

/** Google Ads specific configuration */
export interface GoogleAdsConfig {
  /** Google Ads measurement ID (e.g., 'AW-17773015108') */
  measurementId: string;
  /** Optional conversion label for specific conversion actions */
  conversionLabel?: string;
}

// =============================================================================
// FUTURE VENDOR CONFIGS (uncomment when implementing)
// =============================================================================

// /** Meta/Facebook Pixel configuration */
// export interface MetaPixelConfig {
//   /** Facebook Pixel ID */
//   pixelId: string;
// }

// /** LinkedIn Insight Tag configuration */
// export interface LinkedInConfig {
//   /** LinkedIn Partner ID */
//   partnerId: string;
//   /** Conversion ID for tracking specific actions */
//   conversionId?: number;
// }

/** Combined vendor configuration */
export interface TrackingPixelConfig {
  google?: GoogleAdsConfig;
  // Future vendors:
  // meta?: MetaPixelConfig;
  // linkedin?: LinkedInConfig;
  /** Enable debug logging in development */
  debug?: boolean;
}
