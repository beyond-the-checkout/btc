/**
 * Google Tag (gtag.js) Component
 *
 * Loads the Google Ads/Analytics gtag.js script globally.
 * Should be placed in the root layout for site-wide tracking.
 */

import Script from "next/script";
import { GOOGLE_ADS_ID } from "./config";

/**
 * GoogleTag component - loads gtag.js for Google Ads/Analytics tracking.
 *
 * Only renders if NEXT_PUBLIC_GOOGLE_ADS_ID is configured.
 *
 * @example
 * // In root layout.tsx
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
 */
export function GoogleTag() {
  if (!GOOGLE_ADS_ID) {
    return null;
  }

  return (
    <>
      {/* Load gtag.js script asynchronously */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />

      {/* Initialize gtag with measurement ID */}
      <Script id="google-gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GOOGLE_ADS_ID}');
        `}
      </Script>
    </>
  );
}
