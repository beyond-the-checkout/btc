"use client";

import { PosthogPageview } from "@/ui/layout/posthog-pageview";
import {
  KeyboardShortcutProvider,
  TooltipProvider,
  useRemoveGAParams,
} from "@dub/ui";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { ReactNode, useEffect } from "react";
import { Toaster } from "sonner";

export default function RootProviders({ children }: { children: ReactNode }) {
  useRemoveGAParams();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        ui_host: "https://us.posthog.com",
        person_profiles: "identified_only",
        capture_pageview: false, // Disable automatic pageview capture, as we capture manually
        capture_pageleave: true, // Enable pageleave capture
      });
    }
  }, []);

  return (
    <PostHogProvider client={posthog}>
      <TooltipProvider>
        <KeyboardShortcutProvider>
          <Toaster className="pointer-events-auto" closeButton />
          <PosthogPageview />
          {children}
        </KeyboardShortcutProvider>
      </TooltipProvider>
    </PostHogProvider>
  );
}
