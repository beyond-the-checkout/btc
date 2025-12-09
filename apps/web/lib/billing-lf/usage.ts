import { prefixWorkspaceId } from "@/lib/api/workspaces/workspace-id";
import { tb } from "@/lib/tinybird";
import z from "@/lib/zod";
import { usageQuerySchema, usageResponse } from "@/lib/zod/schemas/usage";
import type { UsagePointT } from "./types";

/**
 * Usage Service (Tinybird Wrapper)
 *
 * Provides a simple interface for fetching workspace usage data
 * from Tinybird's v3_usage pipe.
 *
 * This wraps the existing Tinybird infrastructure to keep the LF
 * service layer clean and testable.
 */

export interface GetUsageArgs {
  workspaceId: string;
  resource: "links" | "events";
  start: string; // ISO 8601
  end: string; // ISO 8601
  timezone?: string; // defaults to UTC
}

/**
 * Get usage data for a workspace
 *
 * @param args - Usage query parameters
 * @returns Array of time-series usage points
 */
export async function getUsage(args: GetUsageArgs): Promise<UsagePointT[]> {
  const { workspaceId, resource, start, end, timezone = "UTC" } = args;

  // Build Tinybird pipe (reusing existing infrastructure)
  const pipe = tb.buildPipe({
    pipe: "v3_usage",
    parameters: usageQuerySchema.extend({
      workspaceId: z
        .string()
        .optional()
        .transform((v) => (v ? prefixWorkspaceId(v) : undefined)),
      start: z.string(),
      end: z.string(),
    }),
    data: usageResponse,
  });

  const response = await pipe({
    resource,
    workspaceId,
    start,
    end,
    timezone,
  });

  // Normalize to UsagePointT format
  return response.data.map((point) => ({
    ts: point.date, // ISO string from Tinybird schema
    value: point.value,
  }));
}
