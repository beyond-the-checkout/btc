"use client";

/**
 * Tracking Pixels - Conversion Hook
 *
 * React hook for firing conversion events.
 * Currently supports Google Ads only. Extensible for future vendors.
 */

import { useCallback } from "react";
import { getTrackingConfig } from "./config";
import type { ConversionEvent, ConversionEventType } from "./types";

/** Local type for window with tracking pixel SDKs */
type TrackingWindow = Window &
  typeof globalThis & {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    // Future vendors:
    // fbq?: (action: string, event: string, params?: Record<string, any>) => void;
    // lintrk?: (action: string, params: Record<string, any>) => void;
  };

/** Get typed window object */
const getWindow = (): TrackingWindow | undefined =>
  typeof window !== "undefined" ? (window as TrackingWindow) : undefined;

/** Map standard event types to Google Ads event names */
const GOOGLE_EVENT_MAP: Record<ConversionEventType, string> = {
  page_view: "page_view",
  lead: "generate_lead",
  signup: "sign_up",
  purchase: "purchase",
  application_submitted: "submit_application",
  custom: "conversion",
};

/**
 * Fire a Google Ads conversion event
 */
function fireGoogleConversion(
  event: ConversionEvent,
  measurementId: string,
  conversionLabel?: string,
  debug?: boolean,
) {
  const win = getWindow();
  if (!win?.gtag) {
    if (debug) console.warn("[TrackingPixels] gtag not available");
    return;
  }

  const eventName =
    event.type === "custom" && event.customEventName
      ? event.customEventName
      : GOOGLE_EVENT_MAP[event.type];

  const eventParams: Record<string, any> = {
    send_to: conversionLabel
      ? `${measurementId}/${conversionLabel}`
      : measurementId,
    ...event.params,
  };

  if (event.value !== undefined) {
    eventParams.value = event.value;
    eventParams.currency = event.currency || "USD";
  }

  if (event.transactionId) {
    eventParams.transaction_id = event.transactionId;
  }

  if (debug) {
    console.log("[TrackingPixels] Google:", eventName, eventParams);
  }

  win.gtag("event", eventName, eventParams);
}

// =============================================================================
// FUTURE VENDOR IMPLEMENTATIONS (uncomment when implementing)
// =============================================================================

// /** Map standard event types to Meta Pixel event names */
// const META_EVENT_MAP: Record<ConversionEventType, string> = {
//   page_view: "PageView",
//   lead: "Lead",
//   signup: "CompleteRegistration",
//   purchase: "Purchase",
//   application_submitted: "SubmitApplication",
//   custom: "CustomEvent",
// };

// /** Fire a Meta/Facebook Pixel conversion event */
// function fireMetaConversion(
//   event: ConversionEvent,
//   pixelId: string,
//   debug?: boolean,
// ) {
//   const win = getWindow();
//   if (!win?.fbq) {
//     if (debug) console.warn("[TrackingPixels] fbq not available");
//     return;
//   }
//   const eventName = event.type === "custom" && event.customEventName
//     ? event.customEventName
//     : META_EVENT_MAP[event.type];
//   const eventParams: Record<string, any> = { ...event.params };
//   if (event.value !== undefined) {
//     eventParams.value = event.value;
//     eventParams.currency = event.currency || "USD";
//   }
//   if (debug) console.log("[TrackingPixels] Meta:", eventName, eventParams);
//   win.fbq("track", eventName, eventParams);
// }

// /** Fire a LinkedIn Insight Tag conversion event */
// function fireLinkedInConversion(
//   conversionId: number,
//   debug?: boolean,
// ) {
//   const win = getWindow();
//   if (!win?.lintrk) {
//     if (debug) console.warn("[TrackingPixels] lintrk not available");
//     return;
//   }
//   if (debug) console.log("[TrackingPixels] LinkedIn:", { conversion_id: conversionId });
//   win.lintrk("track", { conversion_id: conversionId });
// }

/**
 * Hook to track conversions with Google Ads.
 *
 * @example
 * const { trackConversion } = useTrackConversion();
 *
 * // Track a lead conversion
 * trackConversion({ type: "lead" });
 *
 * // Track a purchase with value
 * trackConversion({
 *   type: "purchase",
 *   value: 99.99,
 *   currency: "USD",
 *   transactionId: "order-123"
 * });
 */
export function useTrackConversion() {
  const trackConversion = useCallback((event: ConversionEvent) => {
    const config = getTrackingConfig();

    // Fire Google conversion
    if (config.google) {
      fireGoogleConversion(
        event,
        config.google.measurementId,
        config.google.conversionLabel,
        config.debug,
      );
    }

    // Future vendors (uncomment when implementing):
    // if (config.meta) {
    //   fireMetaConversion(event, config.meta.pixelId, config.debug);
    // }
    // if (config.linkedin?.conversionId) {
    //   fireLinkedInConversion(config.linkedin.conversionId, config.debug);
    // }
  }, []);

  return { trackConversion };
}

/**
 * Standalone function to track conversions (for use outside React components).
 *
 * @example
 * import { trackConversion } from "@/lib/tracking-pixels";
 * trackConversion({ type: "lead" });
 */
export function trackConversion(event: ConversionEvent) {
  const config = getTrackingConfig();

  if (config.google) {
    fireGoogleConversion(
      event,
      config.google.measurementId,
      config.google.conversionLabel,
      config.debug,
    );
  }

  // Future vendors (uncomment when implementing):
  // if (config.meta) {
  //   fireMetaConversion(event, config.meta.pixelId, config.debug);
  // }
  // if (config.linkedin?.conversionId) {
  //   fireLinkedInConversion(config.linkedin.conversionId, config.debug);
  // }
}
