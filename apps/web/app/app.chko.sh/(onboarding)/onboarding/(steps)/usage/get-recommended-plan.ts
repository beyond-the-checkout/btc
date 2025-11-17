import { OnboardingUsageSchema } from "@/lib/zod/schemas/workspaces";
import { z } from "zod";

export const PLAN_THRESHOLDS = {
  FREE: { maxScans: 50_000, maxQrCodes: 1_000 },
  PRO: { maxScans: 250_000, maxQrCodes: 10_000 },
} as const;

export const PLAN_NAMES = {
  FREE: "free",
  PRO: "pro",
  BUSINESS: "business",
} as const;

export function getRecommendedPlan({
  qrCodes,
  scans,
  packaging,
}: z.infer<typeof OnboardingUsageSchema>) {
  if (
    scans <= PLAN_THRESHOLDS.FREE.maxScans &&
    qrCodes <= PLAN_THRESHOLDS.FREE.maxQrCodes &&
    packaging !== "full"
  ) {
    return PLAN_NAMES.FREE;
  }

  if (
    scans <= PLAN_THRESHOLDS.PRO.maxScans &&
    qrCodes <= PLAN_THRESHOLDS.PRO.maxQrCodes
  ) {
    return PLAN_NAMES.PRO;
  }

  if (packaging === "full") {
    return PLAN_NAMES.BUSINESS;
  }

  return PLAN_NAMES.BUSINESS;
}
