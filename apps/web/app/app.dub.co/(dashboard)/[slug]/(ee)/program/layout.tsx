/**
 * Partner Program layout wrapper.
 *
 * Deployment feature flags (`@/lib/feature-flags`) govern whether the entire
 * partner program surface area exists for this deployment, while
 * `ProgramAuth` continues to enforce workspace-level plan capabilities. Keep
 * both systems in sync when introducing new partner features.
 */
import { isFeatureEnabled } from "@/lib/feature-flags";
import { ReactNode } from "react";
import { notFound } from "next/navigation";
import ProgramAuth from "./auth";

export default function ProgramLayout({ children }: { children: ReactNode }) {
  // Deployment guards run before plan checks so disabled features 404 early.
  if (!isFeatureEnabled("partnerProgram")) {
    notFound();
  }

  return <ProgramAuth>{children}</ProgramAuth>;
}
