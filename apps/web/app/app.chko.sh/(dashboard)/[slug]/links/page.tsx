/**
 * Workspace links entry point.
 *
 * Checks deployment feature flags before rendering the short links product,
 * complementing plan capability checks inside nested client components. When
 * the `links` flag is disabled the entire route returns a 404, ensuring
 * navigation and deep links stay in sync.
 */
import { isFeatureEnabled } from "@/lib/feature-flags";
import { QROnboardingBanner } from "@/ui/workspaces/qr-onboarding-banner";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import WorkspaceLinksClient from "./page-client";

export default function WorkspaceLinks() {
  // Hide the entire feature when the deployment flag is off.
  if (!isFeatureEnabled("links")) {
    notFound();
  }

  return (
    <>
      <Suspense>
        <QROnboardingBanner />
      </Suspense>
      <WorkspaceLinksClient />
    </>
  );
}
