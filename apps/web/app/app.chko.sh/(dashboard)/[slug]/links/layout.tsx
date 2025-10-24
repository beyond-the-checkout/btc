/**
 * Links feature layout guard.
 *
 * Ensures every route under `/links` respects deployment feature flags before
 * rendering nested client components. Use this pattern when adding additional
 * top-level product areas that can be disabled at deploy time.
 */
import { isFeatureEnabled } from "@/lib/feature-flags";
import { notFound } from "next/navigation";
import { ReactNode } from "react";

export default function LinksLayout({ children }: { children: ReactNode }) {
  // Centralized guard for all nested link routes.
  if (!isFeatureEnabled("links")) {
    notFound();
  }

  return <>{children}</>;
}
