import { DubApiError } from "@/lib/api/errors";
import { withWorkspace } from "@/lib/auth";
import { listInvoices } from "@/lib/billing-lf/invoices";
import { NextResponse } from "next/server";
import z from "@/lib/zod";

/**
 * GET /api/workspaces/[idOrSlug]/billing-lf/invoices
 *
 * List invoices by type
 * - subscription: from payment provider
 * - partnerPayout: from database
 * - domainRenewal: from database
 */
export const GET = withWorkspace(async ({ req, workspace }) => {
  const { searchParams } = new URL(req.url);

  const querySchema = z.object({
    type: z.enum(["subscription", "partnerPayout", "domainRenewal"], {
      errorMap: () => ({
        message:
          "Invalid query parameters. 'type' must be one of: subscription, partnerPayout, domainRenewal.",
      }),
    }),
    limit: z.coerce.number().optional(),
    startingAfter: z.string().optional(),
    cursor: z.string().optional(),
  });

  const parsed = querySchema.safeParse({
    type: searchParams.get("type"),
    limit: searchParams.get("limit"),
    startingAfter: searchParams.get("startingAfter"),
    cursor: searchParams.get("cursor"),
  });

  if (!parsed.success) {
    throw new DubApiError({
      code: "unprocessable_entity",
      message:
        "Invalid query parameters. 'type' must be one of: subscription, partnerPayout, domainRenewal.",
    });
  }

  const { type, limit, startingAfter, cursor } = parsed.data;

  const invoices = await listInvoices(workspace.id, type, {
    limit,
    startingAfter,
    cursor,
  });

  return NextResponse.json(invoices);
});
