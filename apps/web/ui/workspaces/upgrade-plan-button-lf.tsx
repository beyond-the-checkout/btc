"use client";

import { getStripe } from "@/lib/stripe/client";
import { useWorkspace } from "@/lib/swr-lf";
import { Button, ButtonProps } from "@dub/ui";
import { APP_DOMAIN, capitalize, SELF_SERVE_PAID_PLANS } from "@dub/utils";
import { usePlausible } from "next-plausible";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { useState } from "react";

export function UpgradePlanButtonLF({
  plan,
  period,
  ...rest
}: {
  plan: string;
  period: "monthly" | "yearly";
} & Partial<ButtonProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { slug: workspaceSlug, plan: currentPlan } = useWorkspace();

  const plausible = usePlausible();

  const selectedPlan =
    SELF_SERVE_PAID_PLANS.find(
      (p) => p.name.toLowerCase() === plan.toLowerCase(),
    ) ?? SELF_SERVE_PAID_PLANS[0];

  const [clicked, setClicked] = useState(false);

  const queryString = searchParams.toString();

  const isCurrentPlan = currentPlan === selectedPlan.name.toLowerCase();

  return (
    <Button
      text={
        isCurrentPlan
          ? "Your current plan"
          : currentPlan === "free"
            ? `Get started with ${selectedPlan.name} ${capitalize(period)}`
            : `Switch to ${selectedPlan.name} ${capitalize(period)}`
      }
      loading={clicked}
      disabled={!workspaceSlug || isCurrentPlan}
      onClick={() => {
        setClicked(true);
        fetch(`/api/workspaces/${workspaceSlug}/billing-lf/upgrade`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            plan,
            period,
            baseUrl: `${APP_DOMAIN}${pathname}${queryString.length > 0 ? `?${queryString}` : ""}`,
            onboarding: searchParams.get("workspace") ?? undefined,
          }),
        })
          .then(async (res) => {
            if (!res.ok) {
              const error = await res.json();
              throw new Error(error.error?.message || "Failed to create checkout session");
            }

            plausible("Opened Checkout");
            posthog.capture("checkout_opened", {
              currentPlan: capitalize(plan),
              newPlan: selectedPlan.name,
            });

            const data = await res.json();

            // Handle sessionId (checkout) vs redirectUrl (portal)
            if (data.sessionId) {
              const stripe = await getStripe();
              stripe?.redirectToCheckout({ sessionId: data.sessionId });
            } else if (data.redirectUrl) {
              router.push(data.redirectUrl);
            } else {
              throw new Error("No session ID or redirect URL returned");
            }
          })
          .catch((err) => {
            alert(err);
          })
          .finally(() => {
            setClicked(false);
          });
      }}
      {...rest}
    />
  );
}
