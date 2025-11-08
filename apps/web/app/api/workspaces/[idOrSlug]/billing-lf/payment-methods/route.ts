import { DubApiError } from "@/lib/api/errors";
import { withWorkspace } from "@/lib/auth";
import { assertPaymentMethodAllowed } from "@/lib/billing-lf/policies";
import { getProvider } from "@/lib/billing-lf/provider";
import { APP_DOMAIN } from "@dub/utils";
import { NextResponse } from "next/server";
import z from "@/lib/zod";

/**
 * GET /api/workspaces/[idOrSlug]/billing-lf/payment-methods
 *
 * List all payment methods for a workspace (direct debit first)
 */
export const GET = withWorkspace(async ({ workspace }) => {
  const provider = getProvider();

  const paymentMethods = await provider.listPaymentMethods({
    workspaceId: workspace.id,
  });

  return NextResponse.json(paymentMethods);
});

/**
 * POST /api/workspaces/[idOrSlug]/billing-lf/payment-methods
 *
 * Add a payment method
 * - No method → portal flow for update
 * - With method → setup flow (checkout/setup session)
 */
export const POST = withWorkspace(async ({ req, workspace }) => {
  const body = await req.json();

  const schema = z.object({
    method: z
      .enum(["sepa_debit", "us_bank_account", "acss_debit", "card", "link"])
      .optional(),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    console.error("Payment methods validation error:", parsed.error);
    throw new DubApiError({
      code: "unprocessable_entity",
      message: "Invalid request body",
    });
  }

  const { method } = parsed.data;

  // Enforce plan policy (e.g., SEPA only for Enterprise)
  if (method) {
    try {
      assertPaymentMethodAllowed({
        plan: workspace.plan,
        method,
      });
    } catch (error) {
      console.error("Payment method policy violation:", {
        method,
        plan: workspace.plan,
        error,
      });
      throw new DubApiError({
        code: "forbidden",
        message: error instanceof Error ? error.message : "Payment method not allowed",
      });
    }
  }

  const provider = getProvider();

  const getBillingReturnUrl = (slug: string) => `${APP_DOMAIN}/${slug}/settings/billing`;

  const { redirectUrl } = await provider.addPaymentMethod({
    workspaceId: workspace.id,
    method,
    returnUrl: getBillingReturnUrl(workspace.slug),
  });

  return NextResponse.json({ redirectUrl });
});
