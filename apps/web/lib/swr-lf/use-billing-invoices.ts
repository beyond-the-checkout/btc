import { InvoiceItemT } from "@/lib/billing-lf/types";
import { fetcher } from "@dub/utils";
import useSWR from "swr";
import useWorkspace from "../swr/use-workspace";

/**
 * License-free hook for fetching invoices
 * Wraps the LF invoices endpoint, which merges provider (Stripe) and DB invoices
 */
export default function useBillingInvoices({
  type,
}: {
  type: "subscription" | "partnerPayout" | "domainRenewal";
}) {
  const { id: workspaceId } = useWorkspace();

  const {
    data,
    error,
    mutate,
  } = useSWR<InvoiceItemT[]>(
    workspaceId &&
      `/api/workspaces/${workspaceId}/billing-lf/invoices?${new URLSearchParams({
        type,
      }).toString()}`,
    fetcher,
    {
      dedupingInterval: 60000,
    },
  );

  return {
    data,
    loading: !error && !data,
    error,
    mutate,
  };
}
