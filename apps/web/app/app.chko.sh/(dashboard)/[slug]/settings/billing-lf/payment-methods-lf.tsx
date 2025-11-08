"use client";

import { PaymentMethodSummaryT } from "@/lib/billing-lf/types";
import { useBillingPaymentMethods, useWorkspace } from "@/lib/swr-lf";
import { AnimatedEmptyState } from "@/ui/shared/animated-empty-state";
import {
  Badge,
  Button,
  CardAmex,
  CardDiscover,
  CardMastercard,
  CardVisa,
  CreditCard,
  GreekTemple,
  StripeLink,
} from "@dub/ui";
import { cn } from "@dub/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PaymentMethodsLF() {
  const router = useRouter();
  const { data: paymentMethods } = useBillingPaymentMethods();
  const [isLoading, setIsLoading] = useState(false);
  const { slug, stripeId, plan } = useWorkspace();

  const regularPaymentMethods = paymentMethods?.filter(
    (pm) => !pm.isDirectDebit,
  );

  const directDebitMethods = paymentMethods?.filter((pm) => pm.isDirectDebit);

  const managePaymentMethods = async () => {
    setIsLoading(true);
    const { redirectUrl } = await fetch(
      `/api/workspaces/${slug}/billing-lf/payment-methods`,
      {
        method: "POST",
        body: JSON.stringify({}),
      },
    ).then((res) => res.json());

    router.push(redirectUrl);
  };

  if (plan === "free") {
    return null;
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      <div className="flex flex-col items-start justify-between gap-y-4 p-6 md:flex-row md:items-center md:p-8">
        <div>
          <h2 className="text-xl font-medium">Payment methods</h2>
          <p className="text-balance text-sm leading-normal text-neutral-500">
            Manage your payment methods
          </p>
        </div>
        {stripeId && (
          <Button
            variant="secondary"
            text="Manage"
            className="h-9 w-fit"
            onClick={() => managePaymentMethods()}
            loading={isLoading}
          />
        )}
      </div>
      <div className="grid gap-4 border-t border-neutral-200 bg-neutral-100 p-6">
        {regularPaymentMethods ? (
          regularPaymentMethods.length > 0 ? (
            regularPaymentMethods.map((paymentMethod) => (
              <PaymentMethodCard
                key={paymentMethod.id}
                paymentMethod={paymentMethod}
              />
            ))
          ) : (
            <AnimatedEmptyState
              title="No payment methods found"
              description="You haven't added any payment methods yet"
              cardContent={() => (
                <>
                  <CreditCard className="size-4 text-neutral-700" />
                  <div className="h-2.5 w-24 min-w-0 rounded-sm bg-neutral-200" />
                </>
              )}
              className="border-none md:min-h-[250px]"
            />
          )
        ) : (
          <PaymentMethodCardSkeleton />
        )}

        {directDebitMethods ? (
          directDebitMethods.length > 0 ? (
            directDebitMethods.map((paymentMethod) => (
              <PaymentMethodCard
                key={paymentMethod.id}
                paymentMethod={paymentMethod}
                forPayouts={true}
              />
            ))
          ) : null
        ) : (
          <PaymentMethodCardSkeleton />
        )}
      </div>
    </div>
  );
}

const PaymentMethodCard = ({
  paymentMethod,
  forPayouts = false,
}: {
  paymentMethod: PaymentMethodSummaryT;
  forPayouts?: boolean;
}) => {
  const { type, brand, isDirectDebit, connected, displayName } = paymentMethod;

  // Map type and brand to icon
  const Icon = (() => {
    if (type === "card" && brand) {
      const brandIcons: Record<string, typeof CreditCard> = {
        amex: CardAmex,
        discover: CardDiscover,
        mastercard: CardMastercard,
        visa: CardVisa,
      };
      return brandIcons[brand] ?? CreditCard;
    }
    if (type === "link") {
      return StripeLink;
    }
    if (isDirectDebit) {
      return GreekTemple;
    }
    return CreditCard;
  })();

  const iconBgColor = type === "link" ? "bg-green-100" : "bg-neutral-100";

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 drop-shadow-sm",
        forPayouts && "mt-1",
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex size-12 items-center justify-center rounded-lg",
            iconBgColor,
          )}
        >
          <Icon className="size-6 text-neutral-700" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-neutral-900">{displayName}</p>
            {connected && (
              <Badge className="border-transparent bg-green-200 text-[0.625rem] text-green-900">
                Connected
              </Badge>
            )}
          </div>
          <p className="text-sm text-neutral-500">
            {type === "card"
              ? "Credit or debit card"
              : type === "us_bank_account"
                ? "US Bank account"
                : type === "sepa_debit"
                  ? "SEPA Direct Debit"
                  : type === "acss_debit"
                    ? "ACSS Debit"
                    : type === "link"
                      ? "Link by Stripe"
                      : "Payment method"}
          </p>
        </div>
      </div>
    </div>
  );
};

const PaymentMethodCardSkeleton = () => {
  return (
    <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-4">
      <div className="flex items-center gap-4">
        <div className="flex size-12 animate-pulse items-center justify-center rounded-lg bg-neutral-200" />
        <div>
          <div className="h-5 w-24 animate-pulse rounded-md bg-neutral-200" />
          <div className="mt-1 h-4 w-32 animate-pulse rounded-md bg-neutral-200" />
        </div>
      </div>
    </div>
  );
};
