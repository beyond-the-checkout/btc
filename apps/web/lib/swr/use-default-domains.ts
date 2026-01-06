import { fetcher } from "@dub/utils";
import useSWR from "swr";
import useWorkspace from "./use-workspace";

export default function useDefaultDomains(opts: { search?: string } = {}) {
  const { id: workspaceId } = useWorkspace();

  const { data, error, mutate } = useSWR<string[]>(
    workspaceId &&
      `/api/domains/default?${new URLSearchParams({
        workspaceId,
        ...(opts.search && { search: opts.search }),
      }).toString()}`,
    fetcher,
    {
      dedupingInterval: 60000,
    },
  );

  // Note: Removed noDubLink flag filtering - this is Dub-specific and not relevant for ForeverQRs
  return {
    defaultDomains: data,
    loading: !data && !error,
    mutate,
    error,
  };
}
