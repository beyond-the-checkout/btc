import { UsagePointT } from "@/lib/billing-lf/types";
import { fetcher, getFirstAndLastDay } from "@dub/utils";
import useSWR from "swr";
import useWorkspace from "../swr/use-workspace";

/**
 * License-free hook for fetching billing usage data
 * Mirrors the pattern from useUsage() but hits the LF endpoint
 * and returns normalized UsagePointT[] instead of UsageResponse[]
 */
export default function useBillingUsage({
  resource,
}: {
  resource: "links" | "events";
}) {
  const { id: workspaceId, billingCycleStart } = useWorkspace();
  const { firstDay, lastDay } = getFirstAndLastDay(billingCycleStart ?? 0);

  const {
    data: usage,
    error,
    isValidating,
  } = useSWR<UsagePointT[]>(
    workspaceId &&
      `/api/workspaces/${workspaceId}/billing-lf/usage?${new URLSearchParams({
        resource,
        start: firstDay.toISOString().replace("T", " ").replace("Z", ""),
        // get end of the day (11:59:59 PM)
        end: new Date(lastDay.getTime() + 86399999)
          .toISOString()
          .replace("T", " ")
          .replace("Z", ""),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }).toString()}`,
    fetcher,
    {
      dedupingInterval: 60000,
    },
  );

  return {
    usage,
    loading: !usage && !error,
    isValidating,
  };
}
