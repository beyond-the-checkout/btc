import { getDubCustomer } from "@/lib/dub";
import {
  DIRECT_DEBIT_PAYMENT_METHOD_TYPES,
  DIRECT_DEBIT_PAYMENT_TYPES_INFO,
} from "@/lib/partners/constants";
import { stripe } from "@/lib/stripe";
import { APP_DOMAIN } from "@dub/utils";
import { prisma } from "@dub/prisma";
import { DubApiError } from "@/lib/api/errors";
import type Stripe from "stripe";
import type { BillingProvider } from "../provider";
import type { PaymentMethodSummaryT } from "../types";

/**
 * Stripe Adapter
 *
 * Implements BillingProvider interface using Stripe as the payment provider.
 * All Stripe-specific logic is encapsulated here.
 */
export class StripeAdapter implements BillingProvider {
  async createUpgradeSession(args: {
    workspaceId: string;
    workspaceSlug: string;
    currentPlan: string;
    plan: string;
    period: "monthly" | "yearly";
    baseUrl: string;
    onboarding?: string;
    userId: string;
    userEmail: string;
  }) {
    // Security: validate base URL
    if (!args.baseUrl.startsWith(APP_DOMAIN)) {
      throw new DubApiError({ code: "bad_request", message: "Invalid baseUrl" });
    }

    // Get workspace with Stripe ID
    const workspace = await prisma.project.findUnique({
      where: { id: args.workspaceId },
      select: { stripeId: true },
    });

    // Build Stripe price lookup key
    const plan = args.plan.replace(" ", "+").toLowerCase();
    const lookupKey = `${plan}_${args.period}`;

    const prices = await (async () => {
      try {
        return await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1 });
      } catch (error: any) {
        throw new DubApiError({
          code: "bad_request",
          message: error?.raw?.message || "Failed to list Stripe prices",
        });
      }
    })();

    if (!prices.data[0]) {
      throw new DubApiError({
        code: "not_found",
        message: `Price not found for lookup key: ${lookupKey}`,
      });
    }

    const priceId = prices.data[0].id;

    // Check for active subscription
    const activeSubscription = workspace?.stripeId
      ? await (async () => {
          try {
            const stripeId = workspace.stripeId as string;
            const res = await stripe.subscriptions.list({
              customer: stripeId,
              status: "active",
              limit: 1,
            });
            return res.data[0];
          } catch (error: any) {
            throw new DubApiError({
              code: "bad_request",
              message:
                error?.raw?.message ||
                "Failed to retrieve active Stripe subscription",
            });
          }
        })()
      : null;

    // Active subscription → portal with update flow
    if (workspace?.stripeId && activeSubscription) {
      const { url } = await (async () => {
        try {
          const stripeId = workspace.stripeId as string;
          return await stripe.billingPortal.sessions.create({
            customer: stripeId,
            return_url: args.baseUrl,
            flow_data: {
              type: "subscription_update_confirm",
              subscription_update_confirm: {
                subscription: activeSubscription.id,
                items: [
                  {
                    id: activeSubscription.items.data[0].id,
                    quantity: 1,
                    price: priceId,
                  },
                ],
              },
            },
          });
        } catch (error: any) {
          throw new DubApiError({
            code: "bad_request",
            message:
              error?.raw?.message ||
              "Failed to create Stripe billing portal session",
          });
        }
      })();

      if (!url) {
        throw new DubApiError({
          code: "internal_server_error",
          message: "Failed to generate billing portal URL",
        });
      }

      return { redirectUrl: url };
    }

    // No subscription or canceled → checkout session
    const customer = await getDubCustomer(args.userId).catch(() => null);

    const stripeSession = await (async () => {
      try {
        return await stripe.checkout.sessions.create({
          ...(workspace?.stripeId
            ? {
                customer: (workspace.stripeId as string),
                customer_update: {
                  name: "auto",
                  address: "auto",
                },
              }
            : {
                customer_email: args.userEmail,
              }),
          billing_address_collection: "required",
          success_url: `${APP_DOMAIN}/${args.workspaceSlug}?${args.onboarding ? "onboarded" : "upgraded"}=true&plan=${plan}&period=${args.period}`,
          cancel_url: args.baseUrl,
          line_items: [{ price: priceId, quantity: 1 }],
          ...(customer?.discount?.couponId
            ? {
                discounts: [
                  {
                    coupon:
                      process.env.NODE_ENV !== "production" &&
                      customer.discount.couponTestId
                        ? customer.discount.couponTestId
                        : customer.discount.couponId,
                  },
                ],
              }
            : { allow_promotion_codes: true }),
          automatic_tax: {
            enabled: true,
          },
          tax_id_collection: {
            enabled: true,
          },
          mode: "subscription",
          client_reference_id: args.workspaceId,
          metadata: {
            dubCustomerId: args.userId,
          },
        });
      } catch (error: any) {
        throw new DubApiError({
          code: "bad_request",
          message:
            error?.raw?.message || "Failed to create Stripe checkout session",
        });
      }
    })();

    return { sessionId: stripeSession.id };
  }

  async createPortalSession(args: {
    workspaceId: string;
    workspaceSlug: string;
    returnUrl: string;
    mode: "manage" | "cancel" | "updatePaymentMethod";
  }) {
    // Security: validate return URL
    if (!args.returnUrl.startsWith(APP_DOMAIN)) {
      throw new DubApiError({ code: "bad_request", message: "Invalid returnUrl" });
    }

    const workspace = await prisma.project.findUnique({
      where: { id: args.workspaceId },
      select: { stripeId: true },
    });

    if (!workspace?.stripeId) {
      throw new DubApiError({
        code: "bad_request",
        message: "Workspace does not have a Stripe ID",
      });
    }

    const flowDataMap = {
      manage: undefined, // general portal (no specific flow)
      cancel: {
        type: "subscription_cancel" as const,
      },
      updatePaymentMethod: {
        type: "payment_method_update" as const,
      },
    };

    const { url } = await (async () => {
      try {
        const stripeId = workspace.stripeId as string;
        return await stripe.billingPortal.sessions.create({
          customer: stripeId,
          return_url: args.returnUrl,
          ...(flowDataMap[args.mode] ? { flow_data: flowDataMap[args.mode] } : {}),
        });
      } catch (error: any) {
        throw new DubApiError({
          code: "bad_request",
          message:
            error?.raw?.message ||
            "Failed to create Stripe billing portal session",
        });
      }
    })();

    if (!url) {
      throw new DubApiError({
        code: "internal_server_error",
        message: "Failed to generate billing portal URL",
      });
    }

    return { redirectUrl: url };
  }

  async listPaymentMethods(args: {
    workspaceId: string;
  }): Promise<PaymentMethodSummaryT[]> {
    const workspace = await prisma.project.findUnique({
      where: { id: args.workspaceId },
      select: { stripeId: true },
    });

    if (!workspace?.stripeId) {
      return [];
    }

    const paymentMethods = await (async () => {
      try {
        const stripeId = workspace.stripeId as string;
        return await stripe.paymentMethods.list({
          customer: stripeId,
        });
      } catch (error: any) {
        throw new DubApiError({
          code: "bad_request",
          message:
            error?.raw?.message || "Failed to list Stripe payment methods",
        });
      }
    })();

    // Normalize Stripe payment methods to our schema
    const normalized = paymentMethods.data.map((method) =>
      this.normalizePaymentMethod(method),
    );

    // Reorder: direct debit first (parity with current behavior)
    const directDebit = normalized.find((m) => m.isDirectDebit);

    return [
      ...(directDebit ? [directDebit] : []),
      ...normalized.filter((m) => m.id !== directDebit?.id),
    ];
  }

  async addPaymentMethod(args: {
    workspaceId: string;
    method?: "sepa_debit" | "us_bank_account" | "acss_debit" | "card" | "link";
    returnUrl: string;
    currency?: string;
  }) {
    // Security: validate return URL
    if (!args.returnUrl.startsWith(APP_DOMAIN)) {
      throw new DubApiError({ code: "bad_request", message: "Invalid returnUrl" });
    }

    const workspace = await prisma.project.findUnique({
      where: { id: args.workspaceId },
      select: { stripeId: true },
    });

    if (!workspace?.stripeId) {
      throw new DubApiError({
        code: "bad_request",
        message: "Workspace does not have a Stripe ID",
      });
    }

    // No method specified → portal for general update
    if (!args.method) {
      const { url } = await (async () => {
        try {
          const stripeId = workspace.stripeId as string;
          return await stripe.billingPortal.sessions.create({
            customer: stripeId,
            return_url: args.returnUrl,
            flow_data: {
              type: "payment_method_update",
            },
          });
        } catch (error: any) {
          throw new DubApiError({
            code: "bad_request",
            message:
              error?.raw?.message ||
              "Failed to create Stripe billing portal session",
          });
        }
      })();

      if (!url) {
        throw new DubApiError({
          code: "internal_server_error",
          message: "Failed to generate billing portal URL",
        });
      }

      return { redirectUrl: url };
    }

    // Specific method → setup session
    const paymentMethodOption = DIRECT_DEBIT_PAYMENT_TYPES_INFO.find(
      (type) => type.type === args.method,
    )?.option;

    const { url } = await (async () => {
      try {
        const stripeId = workspace.stripeId as string;
        return await stripe.checkout.sessions.create({
          mode: "setup",
          customer: stripeId,
          payment_method_types: [
            args.method as Stripe.Checkout.SessionCreateParams.PaymentMethodType,
          ],
          payment_method_options: args.method
            ? {
                [args.method]: paymentMethodOption,
              }
            : undefined,
          ...(args.currency ? { currency: args.currency } : {}),
          success_url: args.returnUrl,
          cancel_url: args.returnUrl,
        });
      } catch (error: any) {
        throw new DubApiError({
          code: "bad_request",
          message:
            error?.raw?.message || "Failed to create Stripe setup session",
        });
      }
    })();

    if (!url) {
      throw new DubApiError({
        code: "internal_server_error",
        message: "Failed to generate checkout session URL",
      });
    }

    return { redirectUrl: url };
  }

  async listSubscriptionInvoices(args: {
    workspaceId: string;
    limit?: number;
    startingAfter?: string;
  }) {
    const workspace = await prisma.project.findUnique({
      where: { id: args.workspaceId },
      select: { stripeId: true },
    });

    if (!workspace?.stripeId) {
      return [];
    }

    const invoices = await (async () => {
      try {
        const stripeId = workspace.stripeId as string;
        return await stripe.invoices.list({
          customer: stripeId,
          limit: args.limit ?? 50,
          ...(args.startingAfter ? { starting_after: args.startingAfter } : {}),
        });
      } catch (error: any) {
        throw new DubApiError({
          code: "bad_request",
          message:
            error?.raw?.message || "Failed to list Stripe invoices",
        });
      }
    })();

    return invoices.data.map((invoice) => ({
      id: invoice.id as string,
      total: invoice.total ?? 0, // in cents
      createdAt: new Date(invoice.created * 1000),
      description: "Subscription", // generic description for subscription invoices
      pdfUrl: invoice.invoice_pdf ?? undefined,
      status: this.normalizeInvoiceStatus(invoice.status),
    }));
  }

  // ========================================================================
  // Private Helper Methods
  // ========================================================================

  /**
   * Normalize a Stripe payment method to PaymentMethodSummaryT
   */
  private normalizePaymentMethod(
    method: Stripe.PaymentMethod,
  ): PaymentMethodSummaryT {
    const isDirectDebit = DIRECT_DEBIT_PAYMENT_METHOD_TYPES.includes(
      method.type,
    );

    let displayName = "";
    let brand: string | undefined;
    let last4: string | undefined;

    switch (method.type) {
      case "card":
        brand = method.card?.brand ?? undefined;
        last4 = method.card?.last4 ?? undefined;
        displayName = brand
          ? `${brand.charAt(0).toUpperCase()}${brand.slice(1)} ****${last4}`
          : `Card ****${last4}`;
        break;
      case "us_bank_account":
        last4 = method.us_bank_account?.last4 ?? undefined;
        displayName = `US Bank ****${last4}`;
        break;
      case "sepa_debit":
        last4 = method.sepa_debit?.last4 ?? undefined;
        displayName = `SEPA Debit ****${last4}`;
        break;
      case "acss_debit":
        last4 = method.acss_debit?.last4 ?? undefined;
        displayName = `ACSS Debit ****${last4}`;
        break;
      case "link":
        displayName = "Link";
        break;
      default:
        displayName = method.type;
    }

    return {
      id: method.id,
      type: method.type as PaymentMethodSummaryT["type"],
      brand,
      last4,
      isDirectDebit,
      connected: true, // Stripe payment methods are always connected when listed
      displayName,
    };
  }

  /**
   * Map Stripe invoice status to provider-agnostic status
   */
  private normalizeInvoiceStatus(
    status: Stripe.Invoice.Status | null,
  ): "paid" | "failed" | "pending" | undefined {
    if (!status) return undefined;

    switch (status) {
      case "paid":
        return "paid";
      case "open":
      case "draft":
        return "pending";
      case "void":
      case "uncollectible":
        return "failed";
      default:
        return undefined;
    }
  }
}
