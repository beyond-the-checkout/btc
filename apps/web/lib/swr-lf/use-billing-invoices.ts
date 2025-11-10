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
  type: "subscription";
}) {
  const { id: workspaceId } = useWorkspace();

  const url = workspaceId
    ? `/api/workspaces/${workspaceId}/billing-lf/invoices?${new URLSearchParams({
        type,
      }).toString()}`
    : null;

  if (process.env.NODE_ENV === "development") {
    console.log(
      `[useBillingInvoices] workspaceId=${workspaceId}, type=${type}, url=${url}`,
    );
  }

  const {
    data,
    error,
    mutate,
  } = useSWR<InvoiceItemT[]>(url, fetcher, {
    dedupingInterval: 60000,
    onSuccess: (data) => {
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[useBillingInvoices] Received ${data?.length ?? 0} invoices`,
        );
      }
    },
    onError: (err) => {
      if (process.env.NODE_ENV === "development") {
        console.error(`[useBillingInvoices] Error:`, err);
      }
    },
  });
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[useBillingInvoices] data=${data?.length ?? "undefined"}, loading=${
        !error && !data
      }, error=${error}`,
    );
  }

  return {
    data,
    loading: !error && !data,
    error,
    mutate,
  };
}
