import { DubApiError } from "@/lib/api/errors";
import { withWorkspace } from "@/lib/auth";
import { listInvoices } from "@/lib/billing-lf/invoices";
import { NextResponse } from "next/server";
import z from "@/lib/zod";

/**
 * GET /api/workspaces/[idOrSlug]/billing-lf/invoices
 *
 * List invoices by type
 * - subscription: from payment provider (Stripe)
 *
 * Note: partnerPayout and domainRenewal types were removed from this API
 * as the UI no longer uses them. If reintroducing them in the future, widen
 * the `type` validation and re-add corresponding service handlers.
 */
export const GET = withWorkspace(async ({ req, workspace }) => {
  try {
    const { searchParams } = new URL(req.url);

    const rawParams = {
      type: searchParams.get("type"),
      limit: searchParams.get("limit") || undefined,
      startingAfter: searchParams.get("startingAfter") || undefined,
      cursor: searchParams.get("cursor") || undefined,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("[billing-lf/invoices] Raw query params:", rawParams);
      console.log("[billing-lf/invoices] URL:", req.url);
    }

    const querySchema = z.object({
      type: z.enum(["subscription"], {
        errorMap: () => ({
          message:
            "Invalid query parameters. 'type' must be 'subscription'.",
        }),
      }),
      limit: z.coerce.number().optional(),
      startingAfter: z.string().optional(),
      cursor: z.string().optional(),
    });

    const parsed = querySchema.safeParse(rawParams);

    if (!parsed.success) {
      console.error("[billing-lf/invoices] Query validation failed:", parsed.error);
      throw new DubApiError({
        code: "unprocessable_entity",
        message:
          "Invalid query parameters. 'type' must be one of: subscription, partnerPayout, domainRenewal.",
      });
    }

    const { type, limit, startingAfter, cursor } = parsed.data;

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[billing-lf/invoices] Fetching ${type} invoices for workspace ${workspace.id}`,
      );
    }

    const invoices = await listInvoices(workspace.id, type, {
      limit,
      startingAfter,
      cursor,
    });

    if (process.env.NODE_ENV === "development") {
      console.log(`[billing-lf/invoices] Returning ${invoices.length} invoices`);
    }

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("[billing-lf/invoices] Error:", error);
    throw error;
  }
});
