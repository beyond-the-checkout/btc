import { PaymentMethodSummaryT } from "@/lib/billing-lf/types";
import { fetcher } from "@dub/utils";
import useSWR from "swr";
import useWorkspace from "../swr/use-workspace";

/**
 * License-free hook for fetching payment methods
 * Returns normalized PaymentMethodSummaryT[] instead of raw Stripe.PaymentMethod[]
 */
export default function useBillingPaymentMethods() {
  const { id: workspaceId } = useWorkspace();

  const {
    data,
    error,
    mutate,
  } = useSWR<PaymentMethodSummaryT[]>(
    workspaceId && `/api/workspaces/${workspaceId}/billing-lf/payment-methods`,
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
