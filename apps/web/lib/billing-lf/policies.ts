import type { PlanTierT } from "./types";

/**
 * Billing Policies
 *
 * Business rules and restrictions for billing operations.
 * Centralizes policy enforcement to keep it consistent across API/UI.
 */

/**
 * Payment method restrictions by plan tier
 */
const PAYMENT_METHOD_RESTRICTIONS: Record<
  string,
  { allowedPlans: PlanTierT[] }
> = {
  sepa_debit: {
    allowedPlans: ["enterprise"], // SEPA only available for Enterprise
  },
  // Other payment methods are generally allowed for all plans
};

/**
 * Assert that a payment method is allowed for the workspace's plan
 *
 * @throws Error if payment method is not allowed for the plan
 */
export function assertPaymentMethodAllowed(args: {
  plan: PlanTierT | string;
  method: string;
}): void {
  const restriction = PAYMENT_METHOD_RESTRICTIONS[args.method];

  if (!restriction) {
    // No restriction defined → allowed
    return;
  }

  const planTier = args.plan as PlanTierT;

  if (!restriction.allowedPlans.includes(planTier)) {
    throw new Error(
      `${args.method} is only available for ${restriction.allowedPlans.join(", ")} plans`,
    );
  }
}

/**
 * Check if a plan is a legacy plan (deprecated)
 *
 * Legacy plans have payoutsLimit === 0 (business logic from current implementation)
 */
export function isLegacyPlan(workspace: {
  payoutsLimit?: number | null;
}): boolean {
  return workspace.payoutsLimit === 0;
}

/**
 * Get plan display name with legacy indicator
 */
export function getPlanDisplayName(
  plan: string,
  isLegacy: boolean,
): string {
  const baseName = plan.charAt(0).toUpperCase() + plan.slice(1);
  return isLegacy ? `${baseName} (Legacy)` : baseName;
}
