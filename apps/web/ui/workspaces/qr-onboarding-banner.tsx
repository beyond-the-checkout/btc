"use client";

import {
  QR_ONBOARDING_SOURCE_PARAM,
  QR_ONBOARDING_SOURCE_VALUE,
} from "@/lib/onboarding/qr";
import { dispatchQROnboardingSeed } from "@/lib/onboarding/qr/events";
import {
  LANDING_DRAFT_STORAGE_KEY,
  readDraftsFromStorage,
} from "@/ui/modals/link-builder/use-link-drafts";
import { Button } from "@dub/ui";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Shows a non-intrusive banner prompting QR-first users to open their saved
 * landing-page design in the authenticated editor.
 *
 * Visible only when:
 * - ?onboarded=true
 * - ?source=qr-landing
 * - a landing draft exists in localStorage
 */
export function QROnboardingBanner(): JSX.Element | null {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const onboarded = searchParams.get("onboarded") === "true";
  const source = searchParams.get(QR_ONBOARDING_SOURCE_PARAM);
  const isQrFlow = source === QR_ONBOARDING_SOURCE_VALUE;

  // Read latest landing draft synchronously on the client with storage guards
  let latest: ReturnType<typeof readDraftsFromStorage>[number] | undefined;
  try {
    if (typeof window !== "undefined" && "localStorage" in window) {
      const drafts = readDraftsFromStorage(LANDING_DRAFT_STORAGE_KEY);
      latest = drafts.length > 0 ? drafts[0] : undefined;
    }
  } catch {
    latest = undefined;
  }

  if (!onboarded || !isQrFlow || !latest) {
    return null;
  }

  return (
    <div className="mb-4 rounded-md border border-neutral-200 bg-neutral-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold">Complete your QR</div>
          <div className="truncate text-xs text-neutral-600">
            We saved your design from the landing page. Open it in the editor to
            finish.
          </div>
        </div>
        <Button
          text="Open in editor"
          className="shrink-0"
          onClick={() => {
            dispatchQROnboardingSeed({
              url: latest.link?.url ?? "",
              qrDesign: latest.qrDesign,
            });
            // Drop query params so the banner doesn't reappear
            router.replace(pathname, { scroll: false });
          }}
        />
      </div>
    </div>
  );
}
