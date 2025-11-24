"use client";

import { QR_ONBOARDING_SOURCE_PARAM } from "@/lib/onboarding/qr";
import { PlanFeatures } from "@/ui/workspaces/plan-features";
import { UpgradePlanButton } from "@/ui/workspaces/upgrade-plan-button";
import { Badge, ToggleGroup } from "@dub/ui";
import { ADVANCED_PLAN, BASE_PLAN, BUSINESS_PLAN, cn } from "@dub/utils";
import NumberFlow from "@number-flow/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { CSSProperties, useState } from "react";

export const PLAN_SELECTOR_PLANS = [BASE_PLAN, BUSINESS_PLAN, ADVANCED_PLAN];

// Plans that are coming soon and cannot be upgraded to yet
const COMING_SOON_PLANS = ["business", "advanced"];

export function PlanSelector() {
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const [mobilePlanIndex, setMobilePlanIndex] = useState(0);

  const searchParams = useSearchParams();
  const recommendedPlan = searchParams.get("plan");
  const source = searchParams.get(QR_ONBOARDING_SOURCE_PARAM) ?? undefined;

  return (
    <div>
      <div className="flex justify-center">
        <ToggleGroup
          options={[
            { value: "monthly", label: "Monthly" },
            {
              value: "yearly",
              label: "Yearly (2 months free)",
            },
          ]}
          className="overflow-hidden rounded-lg bg-neutral-100 p-0.5"
          indicatorClassName="rounded-md bg-white shadow-md"
          optionClassName="text-xs py-2 px-5 normal-case"
          selected={period}
          selectAction={(period) => setPeriod(period as "monthly" | "yearly")}
        />
      </div>
      <div className="mt-5 overflow-hidden [container-type:inline-size]">
        <div
          className={cn(
            "grid grid-cols-3",

            // Mobile
            "max-lg:w-[calc(300cqw+2*32px)] max-lg:translate-x-[calc(-1*var(--index)*(100cqw+32px))] max-lg:gap-x-8 max-lg:transition-transform",
          )}
          style={
            {
              "--index": mobilePlanIndex,
            } as CSSProperties
          }
        >
          {PLAN_SELECTOR_PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "flex flex-col border-y border-l border-neutral-200 bg-white p-6 pb-8 first:rounded-l-lg last:rounded-r-lg last:border-r",
                recommendedPlan === plan.name.toLowerCase() &&
                  "bg-gradient-to-b from-[#eef9ff] to-white to-40%",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xl font-semibold text-neutral-800">
                  {plan.name}
                </h2>
                {recommendedPlan
                  ? recommendedPlan === plan.name.toLowerCase() && (
                      <Badge
                        variant="sky"
                        className="px-1.5 py-0.5 text-[0.5rem] uppercase"
                      >
                        Recommended
                      </Badge>
                    )
                  : plan.name === "Business" && (
                      <Badge variant="sky">Most popular</Badge>
                    )}
              </div>
              <div className="mt-1 text-base font-medium text-neutral-400">
                <NumberFlow
                  value={plan.price[period]!}
                  className="tabular-nums text-neutral-700"
                  format={{
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }}
                  continuous
                />
                <span className="ml-1 font-medium">
                  per month
                  {period === "yearly" && ", billed yearly"}
                </span>
              </div>
              <div className="my-6 flex gap-2">
                <button
                  type="button"
                  className="h-full w-fit rounded-lg bg-neutral-100 px-2.5 transition-colors duration-75 hover:bg-neutral-200/80 enabled:active:bg-neutral-200 disabled:opacity-30 lg:hidden"
                  disabled={mobilePlanIndex === 0}
                  onClick={() => setMobilePlanIndex(mobilePlanIndex - 1)}
                >
                  <ChevronLeft className="size-5 text-neutral-800" />
                </button>
                {COMING_SOON_PLANS.includes(plan.name.toLowerCase()) ? (
                  <button
                    type="button"
                    disabled
                    className={cn(
                      "flex h-10 w-full items-center justify-center rounded-lg text-center text-sm font-semibold",
                      "cursor-not-allowed bg-blue-100 text-blue-600",
                    )}
                  >
                    Coming Soon
                  </button>
                ) : (
                  <UpgradePlanButton
                    plan={plan.name.toLowerCase()}
                    period={period}
                    source={source}
                    text="Get started"
                    className="h-10 rounded-lg shadow-sm"
                  />
                )}
                <button
                  type="button"
                  className="h-full w-fit rounded-lg bg-neutral-100 px-2.5 transition-colors duration-75 hover:bg-neutral-200/80 active:bg-neutral-200 disabled:opacity-30 lg:hidden"
                  disabled={mobilePlanIndex >= PLAN_SELECTOR_PLANS.length - 1}
                  onClick={() => setMobilePlanIndex(mobilePlanIndex + 1)}
                >
                  <ChevronRight className="size-5 text-neutral-800" />
                </button>
              </div>
              <PlanFeatures className="mt-2" plan={plan.name} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
