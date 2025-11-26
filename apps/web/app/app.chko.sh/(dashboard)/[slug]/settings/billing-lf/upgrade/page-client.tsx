"use client";

import { useWorkspace } from "@/lib/swr-lf";
import { UpgradePlanButtonLF } from "@/ui/workspaces/upgrade-plan-button-lf";
import {
  ChartLine,
  Check,
  CircleQuestion,
  Globe,
  Hyperlink,
  Icon,
  Plug2,
  ToggleGroup,
  Users2,
} from "@dub/ui";
import { cn, isDowngradePlan, PLAN_COMPARE_FEATURES, PLANS } from "@dub/utils";
import { isLegacyBusinessPlan } from "@dub/utils/src/constants/pricing";
import NumberFlow from "@number-flow/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { CSSProperties, useState } from "react";

const COMPARE_FEATURE_ICONS: Record<
  (typeof PLAN_COMPARE_FEATURES)[number]["category"],
  Icon
> = {
  "QR Codes": Hyperlink,
  Analytics: ChartLine,
  Domains: Globe,
  Workspace: Users2,
  Support: CircleQuestion,
  API: Plug2,
};

const plans = ["Free", "Base", "Business", "Advanced"].map(
  (p) => PLANS.find(({ name }) => name === p)!,
);

const enterprisePlan = PLANS.find((p) => p.name === "Enterprise")!;

// Plans that are coming soon and cannot be upgraded to yet
const COMING_SOON_PLANS = ["business", "advanced"];

export function WorkspaceBillingUpgradePageClientLF() {
  const { slug, plan: currentPlan, stripeId, payoutsLimit } = useWorkspace();

  const [mobilePlanIndex, setMobilePlanIndex] = useState(0);
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");

  return (
    <div>
      <div>
        <Link
          href={`/${slug}/settings/billing`}
          title="Back to billing"
          className="group flex items-center gap-2"
        >
          <ChevronLeft
            className="mt-px size-5 text-neutral-500 transition-transform duration-100 group-hover:-translate-x-0.5"
            strokeWidth={2}
          />
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Plans
          </h1>
        </Link>
      </div>
      <div className="mt-6 flex justify-center">
        <ToggleGroup
          options={[
            { label: "Monthly", value: "monthly" },
            { label: "Yearly (2 months free)", value: "yearly" },
          ]}
          selected={period}
          selectAction={(option) => setPeriod(option as "monthly" | "yearly")}
          className="rounded-lg border-neutral-300 bg-neutral-100 p-0.5"
          optionClassName="text-xs text-neutral-800 data-[selected=true]:text-neutral-800 px-3 sm:px-5 py-2 leading-none"
          indicatorClassName="bg-white border-neutral-200 rounded-md"
        />
      </div>

      <div className="mt-6">
        <div className="sticky -top-px z-10">
          <div className="overflow-x-hidden rounded-b-[12px] from-neutral-200 [container-type:inline-size] lg:bg-gradient-to-t lg:p-px">
            <div
              className={cn(
                "grid grid-cols-4 gap-px overflow-hidden rounded-b-[11px] text-sm text-neutral-800 [&_strong]:font-medium",

                // Mobile
                "max-lg:w-[calc(500cqw+4*32px)] max-lg:translate-x-[calc(-1*var(--index)*(100cqw+32px))] max-lg:gap-x-8 max-lg:transition-transform",
              )}
              style={
                {
                  "--index": mobilePlanIndex,
                } as CSSProperties
              }
            >
              {plans.map((plan, idx) => {
                const disableCurrentPlan = Boolean(
                  stripeId &&
                    plan.name.toLowerCase() === currentPlan &&
                    !isLegacyBusinessPlan({
                      plan: currentPlan,
                      payoutsLimit,
                    }),
                );

                const isDowngrade = Boolean(
                  stripeId && isDowngradePlan(currentPlan || "free", plan.name),
                );

                return (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative top-0 flex h-full flex-col gap-6 bg-white p-5",
                      "max-lg:rounded-xl max-lg:border max-lg:border-neutral-200",

                      idx !== mobilePlanIndex && "max-lg:opacity-0",
                    )}
                  >
                    <div>
                      <h3 className="py-1 text-base font-semibold leading-none text-neutral-800">
                        {plan.name}
                      </h3>
                      <div className="relative mt-0.5 flex items-center gap-1">
                        {plan.name === "Free" ? (
                          <>
                            <span className="text-sm font-medium text-neutral-700">
                              $0
                            </span>
                            <span className="text-sm font-medium text-neutral-400">
                              forever
                            </span>
                          </>
                        ) : (
                          <>
                            <NumberFlow
                              value={plan.price[period]!}
                              className="text-sm font-medium tabular-nums text-neutral-700"
                              format={{
                                style: "currency",
                                currency: "USD",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }}
                              continuous
                            />
                            <span className="text-sm font-medium text-neutral-400">
                              per month
                              {period === "yearly" && ", billed yearly"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="h-full w-fit rounded-lg bg-neutral-100 px-2.5 transition-colors duration-75 hover:bg-neutral-200/80 enabled:active:bg-neutral-200 disabled:opacity-30 lg:hidden"
                        disabled={mobilePlanIndex === 0}
                        onClick={() => setMobilePlanIndex(mobilePlanIndex - 1)}
                      >
                        <ChevronLeft className="size-5 text-neutral-800" />
                      </button>
                      {plan.name === "Free" ? (
                        <button
                          type="button"
                          disabled={disableCurrentPlan}
                          className={cn(
                            "flex h-8 w-full items-center justify-center rounded-md text-center text-sm ring-gray-200 transition-all duration-200 ease-in-out",
                            disableCurrentPlan
                              ? "cursor-not-allowed border border-neutral-200 bg-neutral-50 text-neutral-400"
                              : "border border-neutral-200 bg-white text-neutral-900 shadow-sm hover:bg-neutral-50",
                          )}
                        >
                          {disableCurrentPlan ? "Current plan" : "Free tier"}
                        </button>
                      ) : COMING_SOON_PLANS.includes(
                          plan.name.toLowerCase(),
                        ) ? (
                        <button
                          type="button"
                          disabled
                          className={cn(
                            "flex h-8 w-full items-center justify-center rounded-md text-center text-sm font-semibold",
                            "cursor-not-allowed bg-blue-100 text-blue-600",
                          )}
                        >
                          Coming Soon
                        </button>
                      ) : (
                        <UpgradePlanButtonLF
                          plan={plan.name.toLowerCase()}
                          period={period}
                          disabled={disableCurrentPlan}
                          text={
                            disableCurrentPlan
                              ? "Current plan"
                              : isDowngrade
                                ? "Downgrade"
                                : "Upgrade"
                          }
                          variant={isDowngrade ? "secondary" : "primary"}
                          className="h-8 shadow-sm"
                        />
                      )}
                      <button
                        type="button"
                        className="h-full w-fit rounded-lg bg-neutral-100 px-2.5 transition-colors duration-75 hover:bg-neutral-200/80 active:bg-neutral-200 disabled:opacity-30 lg:hidden"
                        disabled={mobilePlanIndex >= plans.length - 1}
                        onClick={() => setMobilePlanIndex(mobilePlanIndex + 1)}
                      >
                        <ChevronRight className="size-5 text-neutral-800" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="h-8 bg-gradient-to-b from-white" />
        </div>
        <div className="flex flex-col gap-8 pb-8">
          {PLAN_COMPARE_FEATURES.map(({ category, features, comingSoon }) => {
            const Icon = COMPARE_FEATURE_ICONS[category];

            return (
              <div
                key={category}
                className="w-full overflow-x-hidden [container-type:inline-size]"
              >
                <div className="flex items-center gap-2 border-b border-neutral-200 px-5 pb-4 pt-2">
                  {Icon && (
                    <Icon
                      className={cn(
                        "size-4",
                        comingSoon ? "text-neutral-300" : "text-neutral-600",
                      )}
                    />
                  )}
                  <h3
                    className={cn(
                      "text-base font-medium",
                      comingSoon ? "text-neutral-300" : "text-black",
                    )}
                  >
                    {category}
                  </h3>
                  {comingSoon && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">
                      Coming Soon
                    </span>
                  )}
                </div>
                <table
                  className={cn(
                    "grid grid-cols-4 overflow-hidden text-sm text-neutral-800 [&_strong]:font-medium",

                    // Mobile
                    "max-lg:w-[calc(500cqw+4*32px)] max-lg:translate-x-[calc(-1*var(--index)*(100cqw+32px))] max-lg:gap-x-8 max-lg:transition-transform",
                  )}
                  style={
                    {
                      "--index": mobilePlanIndex,
                    } as CSSProperties
                  }
                >
                  <thead className="sr-only">
                    <tr>
                      {plans.map(({ name }) => (
                        <th key={name}>{name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="contents">
                    {features.map(({ check, text }, idx) => {
                      return (
                        <tr key={idx} className="contents bg-white">
                          {plans.map((plan) => {
                            const id = plan.name.toLowerCase();
                            const isChecked = comingSoon
                              ? false
                              : typeof check === "boolean"
                                ? check
                                : check === undefined ||
                                  (check[id] ?? check.default ?? false);

                            return (
                              <td
                                key={id}
                                className={cn(
                                  "flex items-center gap-2 border-b border-neutral-200 bg-white px-5 py-4",
                                  (!isChecked || comingSoon) &&
                                    "text-neutral-300",
                                )}
                              >
                                {isChecked && !comingSoon ? (
                                  <Check className="size-3 text-neutral-500" />
                                ) : (
                                  <span className="w-3">&bull;</span>
                                )}
                                <span>
                                  {typeof text === "function"
                                    ? (text({
                                        id,
                                        plan,
                                      }) as React.ReactNode)
                                    : text}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>

        {/* Enterprise Section */}
        <div className="mb-12 rounded-xl border border-neutral-200 bg-white p-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="text-center md:text-left">
              <h3 className="text-base font-semibold text-neutral-800">
                Enterprise
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                For large organizations with custom needs
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm text-neutral-600">
              <div className="flex items-center gap-2">
                <ChartLine className="size-4 text-neutral-400" />
                <span>Unlimited scans</span>
              </div>
              <div className="flex items-center gap-2">
                <Hyperlink className="size-4 text-neutral-400" />
                <span>Unlimited codes</span>
              </div>
              <div className="flex items-center gap-2">
                <Users2 className="size-4 text-neutral-400" />
                <span>Custom SLA</span>
              </div>
            </div>
            <Link
              href="mailto:support@chko.sh"
              className="flex items-center justify-center whitespace-nowrap rounded-md border border-neutral-200 bg-white px-6 py-2 text-sm font-medium text-neutral-900 shadow-sm transition-colors hover:bg-neutral-50"
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
