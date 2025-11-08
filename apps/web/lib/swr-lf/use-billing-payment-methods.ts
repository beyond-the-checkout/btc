import { PaymentMethodSummaryT } from "@/lib/billing-lf/types";
import { fetcher } from "@dub/utils";
import useSWR, { type SWRConfiguration } from "swr";
import useWorkspace from "../swr/use-workspace";

/**
 * License-free hook for fetching payment methods
 * Returns normalized PaymentMethodSummaryT[] instead of raw Stripe.PaymentMethod[]
 *
 * @returns Payment methods with loading state, error, and mutate
 */
export default function useBillingPaymentMethods({
  swrOpts,
}: {
  swrOpts?: SWRConfiguration;
} = {}) {
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
      ...swrOpts,
    },
  );

  return {
    data,
    loading: !error && !data,
    error,
    mutate,
  };
}
