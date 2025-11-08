import { UsagePointT } from "@/lib/billing-lf/types";
import { fetcher, getFirstAndLastDay, formatDateForAPI, getEndOfDay } from "@dub/utils";
import useSWR from "swr";
import useWorkspace from "../swr/use-workspace";

/**
 * License-free hook for fetching billing usage data
 * Mirrors the pattern from useUsage() but hits the LF endpoint
 * and returns normalized UsagePointT[] instead of UsageResponse[]
 *
 * @param resource - Type of resource to fetch usage for ("links" | "events")
 * @returns Usage data with loading state, mutate, and validation state
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
    mutate,
  } = useSWR<UsagePointT[]>(
    workspaceId &&
      `/api/workspaces/${workspaceId}/billing-lf/usage?${new URLSearchParams({
        resource,
        start: formatDateForAPI(firstDay),
        end: formatDateForAPI(getEndOfDay(lastDay)),
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
    mutate,
  };
}
