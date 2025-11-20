/**
 * Workspace links entry point.
 *
 * Checks deployment feature flags before rendering the short links product,
 * complementing plan capability checks inside nested client components. When
 * the `links` flag is disabled the entire route returns a 404, ensuring
 * navigation and deep links stay in sync.
 */
import { isFeatureEnabled } from "@/lib/feature-flags";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import WorkspaceLinksClient from "./page-client";

export default async function WorkspaceLinks({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Hide the entire feature when the deployment flag is off.
  if (!isFeatureEnabled("links")) {
    notFound();
  }

  return <WorkspaceLinksClient />;
}
