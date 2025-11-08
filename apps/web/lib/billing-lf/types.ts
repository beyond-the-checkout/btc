import z from "@/lib/zod";
import { APP_DOMAIN } from "@dub/utils";

/**
 * Billing & Upgrades (License-Free) - Normalized Types
 *
 * These types abstract away payment provider specifics (e.g., Stripe)
 * to keep the UI/API layer provider-agnostic and license-free.
 */

// ============================================================================
// Plan Tiers & Billing Periods
// ============================================================================

export const PlanTier = z.enum([
  "free",
  "base",
  "business",
  "advanced",
  "enterprise",
]);

export const BillingPeriod = z.enum(["monthly", "yearly"]);

export type PlanTierT = z.infer<typeof PlanTier>;
export type BillingPeriodT = z.infer<typeof BillingPeriod>;

// ============================================================================
// Upgrade Flow
// ============================================================================

/**
 * Request to upgrade a workspace to a specific plan/period
 */
export const UpgradeRequest = z
  .object({
    plan: PlanTier,
    period: BillingPeriod,
    baseUrl: z.string().url(), // must match APP_DOMAIN for security
    onboarding: z.string().optional(), // tracking parameter
  })
  .refine((data) => data.baseUrl.startsWith(APP_DOMAIN), {
    message: "Invalid baseUrl",
    path: ["baseUrl"],
  });

export type UpgradeRequestT = z.infer<typeof UpgradeRequest>;

/**
 * Response from upgrade endpoint
 * - redirectUrl: Provider portal URL (for existing subscriptions)
 * - sessionId: Checkout session ID (for new subscriptions, used with Stripe.js)
 */
export const UpgradeResponse = z.object({
  redirectUrl: z.string().url().optional(),
  sessionId: z.string().optional(),
});

export type UpgradeResponseT = z.infer<typeof UpgradeResponse>;

// ============================================================================
// Payment Methods
// ============================================================================

/**
 * Normalized payment method summary (provider-agnostic)
 */
export const PaymentMethodSummary = z.object({
  id: z.string(),
  type: z.enum(["card", "us_bank_account", "sepa_debit", "link", "acss_debit"]),
  brand: z.string().optional(), // e.g., "visa", "mastercard"
  last4: z.string().optional(), // last 4 digits
  isDirectDebit: z.boolean(),
  connected: z.boolean(), // whether payment method is connected/verified
  displayName: z.string(), // computed display name for UI
});

export type PaymentMethodSummaryT = z.infer<typeof PaymentMethodSummary>;

// ============================================================================
// Invoices
// ============================================================================

/**
 * Normalized invoice item (hybrid: provider + DB sources)
 * - subscription: from payment provider (e.g., Stripe)
 * - partnerPayout: from DB
 * - domainRenewal: from DB
 */
export const InvoiceItem = z.object({
  id: z.string(),
  source: z.enum(["subscription", "partnerPayout", "domainRenewal"]),
  total: z.number(), // in provider minor units (e.g., cents) - UI formats
  createdAt: z.string(), // ISO 8601 string
  status: z.enum(["paid", "failed", "pending"]).optional(),
  description: z.string(),
  paymentMethod: z.string().optional(),
  pdfUrl: z.string().url().optional(),
});

export type InvoiceItemT = z.infer<typeof InvoiceItem>;

// ============================================================================
// Usage & Analytics
// ============================================================================

/**
 * Time-series usage data point
 */
export const UsagePoint = z.object({
  ts: z.string(), // ISO 8601 timestamp
  value: z.number(),
});

export type UsagePointT = z.infer<typeof UsagePoint>;

/**
 * Usage query parameters
 */
export const UsageQuery = z.object({
  resource: z.enum(["links", "events"]),
  start: z.string(), // ISO 8601
  end: z.string(), // ISO 8601
  timezone: z.string().default("UTC"),
});

export type UsageQueryT = z.infer<typeof UsageQuery>;

// ============================================================================
// Notes
// ============================================================================

/**
 * Design Decisions:
 *
 * 1. Amounts in minor units (cents): Avoids silent rounding errors.
 *    UI layer is responsible for formatting (e.g., $20.00).
 *
 * 2. ISO 8601 strings for dates: Provider-agnostic, JSON-friendly.
 *
 * 3. Optional fields: Allow graceful degradation if provider doesn't
 *    support certain features (e.g., not all payment methods have last4).
 *
 * 4. Display names computed server-side: UI doesn't need to know
 *    provider-specific logic for formatting payment method names.
 */
