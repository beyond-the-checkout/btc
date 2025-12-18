"use client";

import { useSession } from "next-auth/react";
import { usePlausible } from "next-plausible";
import posthog from "posthog-js";
import { useEffect, useRef } from "react";
import { trackConversion } from "./use-track-conversion";

/**
 * Component that tracks signup conversion events.
 * Renders nothing but fires tracking events on mount.
 *
 * Tracks to:
 * - Plausible: "Signed Up" event (fires once on mount)
 * - Google Ads: lead conversion (fires once on mount)
 * - PostHog: user identification + "user_signed_up" event (fires once when session available)
 */
export default function TrackSignup() {
  const plausible = usePlausible();
  const { data: session } = useSession();
  const hasTrackedAds = useRef(false);
  const hasTrackedPostHog = useRef(false);

  // Track Plausible and Google Ads once on mount (don't need session)
  useEffect(() => {
    if (hasTrackedAds.current) return;
    hasTrackedAds.current = true;

    // Plausible
    plausible("Signed Up");

    // Google Ads: track signup as a lead conversion
    trackConversion({ type: "lead" });
  }, [plausible]);

  // Track PostHog when session becomes available (needs user data for identify)
  useEffect(() => {
    if (hasTrackedPostHog.current) return;
    if (!session?.user) return;

    hasTrackedPostHog.current = true;
    posthog.identify(session.user["id"], {
      email: session.user.email,
      name: session.user.name,
    });
    posthog.capture("user_signed_up");
  }, [session?.user]);

  return null;
}
