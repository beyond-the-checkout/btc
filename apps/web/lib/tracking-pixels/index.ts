/**
 * Tracking Pixels Module
 *
 * Reusable tracking pixel layer for conversion tracking.
 * Currently supports Google Ads. Extensible for future vendors (Meta, LinkedIn).
 *
 * @example
 * // 1. Add GoogleTag to root layout for global gtag loading
 * import { GoogleTag } from "@/lib/tracking-pixels";
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <GoogleTag />
 *       </body>
 *     </html>
 *   );
 * }
 *
 * @example
 * // 2. Track conversions in components
 * import { useTrackConversion } from "@/lib/tracking-pixels";
 *
 * function SuccessPage() {
 *   const { trackConversion } = useTrackConversion();
 *
 *   useEffect(() => {
 *     trackConversion({ type: "signup" });
 *   }, []);
 * }
 *
 * @example
 * // 3. Track conversions outside React
 * import { trackConversion } from "@/lib/tracking-pixels";
 *
 * trackConversion({ type: "purchase", value: 99.99 });
 */

// Components
export { GoogleTag } from "./google-tag";

// Hooks
export { trackConversion, useTrackConversion } from "./use-track-conversion";

// Configuration
export {
  GOOGLE_ADS_ID,
  GOOGLE_CONVERSION_LABEL_LEAD,
  GOOGLE_CONVERSION_LABEL_PURCHASE,
  getTrackingConfig,
  hasTrackingEnabled,
} from "./config";

// Types
export type {
  ConversionEvent,
  ConversionEventType,
  GoogleAdsConfig,
  TrackingPixelConfig,
  TrackingVendor,
} from "./types";
