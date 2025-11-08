import type {
  BillingPeriodT,
  PaymentMethodSummaryT,
  PlanTierT,
  UpgradeResponseT,
} from "./types";
import { StripeAdapter } from "./providers/stripe";

/**
 * BillingProvider Interface
 *
 * Provider-agnostic abstraction for billing operations.
 * Implementations handle provider-specific details (Stripe, etc.).
 *
 * Benefits:
 * - UI/API depends only on this interface, not Stripe specifics
 * - Enables switching payment providers
 * - Simplifies testing (mock implementations)
 * - Keeps provider coupling isolated to adapters
 */
export interface BillingProvider {
  // ========================================================================
  // Session Management
  // ========================================================================

  /**
   * Create an upgrade session (checkout or portal)
   *
   * Business Logic:
   * - Active subscription → billing portal with update flow
   * - No subscription or canceled → checkout session
   *
   * @returns redirectUrl for portal, or sessionId for checkout
   */
  createUpgradeSession(args: {
    workspaceId: string;
    workspaceSlug: string;
    currentPlan: PlanTierT | string;
    plan: PlanTierT;
    period: BillingPeriodT;
    baseUrl: string;
    onboarding?: string;
    userId: string;
    userEmail: string;
  }): Promise<UpgradeResponseT>;

  /**
   * Create a portal session for subscription management
   *
   * @param mode - manage: general management, cancel: cancellation flow, updatePaymentMethod: payment update
   * @note workspaceSlug may be unused depending on provider; retained for parity with other flows
   * @returns redirectUrl to provider portal
   */
  createPortalSession(args: {
    workspaceId: string;
    workspaceSlug: string;
    returnUrl: string;
    mode: "manage" | "cancel" | "updatePaymentMethod";
  }): Promise<{ redirectUrl: string }>;

  // ========================================================================
  // Payment Methods
  // ========================================================================

  /**
   * List all payment methods for a workspace
   *
   * @returns Normalized payment method summaries (direct debit first)
   */
  listPaymentMethods(args: {
    workspaceId: string;
  }): Promise<PaymentMethodSummaryT[]>;

  /**
   * Add a payment method (setup session or portal)
   *
   * @param method - If specified, creates setup session for that method type
   *                 If undefined, redirects to portal for general update
   * @returns redirectUrl to checkout/portal
   */
  addPaymentMethod(args: {
    workspaceId: string;
    method?: "sepa_debit" | "us_bank_account" | "acss_debit" | "card" | "link";
    returnUrl: string;
    /** Optional currency for setup sessions (defaults to "usd") */
    currency?: string;
  }): Promise<{ redirectUrl: string }>;

  // ========================================================================
  // Invoices
  // ========================================================================

  /**
   * List subscription invoices from provider
   *
   * Note: Partner payouts and domain renewals come from DB (see invoices.ts)
   *
   * @returns Provider invoices with normalized structure
   */
  listSubscriptionInvoices(args: {
    workspaceId: string;
    /** Optional pagination limit (defaults to 50) */
    limit?: number;
    /** Optional Stripe starting_after cursor */
    startingAfter?: string;
  }): Promise<
    {
      id: string;
      total: number; // minor units (cents)
      createdAt: Date;
      description: string;
      pdfUrl?: string;
      status?: "paid" | "failed" | "pending";
    }[]
  >;
}

/**
 * Get the active billing provider instance
 *
 * Currently returns Stripe adapter.
 * Future: Could select based on env var or workspace configuration.
 */
export function getProvider(): BillingProvider {
  return new StripeAdapter();
}
