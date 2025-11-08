import { DubApiError } from "@/lib/api/errors";
import { withWorkspace } from "@/lib/auth";
import { UsageQuery } from "@/lib/billing-lf/types";
import { getUsage } from "@/lib/billing-lf/usage";
import { NextResponse } from "next/server";

/**
 * GET /api/workspaces/[idOrSlug]/billing-lf/usage
 *
 * Get usage data from Tinybird
 * Query params: resource (links|events), start, end, timezone
 */
export const GET = withWorkspace(async ({ req, workspace }) => {
  const { searchParams } = new URL(req.url);

  const parsed = UsageQuery.safeParse({
    resource: searchParams.get("resource"),
    start: searchParams.get("start"),
    end: searchParams.get("end"),
    timezone: searchParams.get("timezone") || "UTC",
  });

  if (!parsed.success) {
    throw new DubApiError({
      code: "unprocessable_entity",
      message: "Invalid query parameters. 'resource', 'start', and 'end' are required.",
    });
  }

  const { resource, start, end, timezone } = parsed.data;

  const usageData = await getUsage({
    workspaceId: workspace.id,
    resource,
    start,
    end,
    timezone,
  });

  return NextResponse.json(usageData);
});
