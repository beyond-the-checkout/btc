"use client";

import {
  ChartLine,
  Check,
  CircleHalfDottedClock,
  Folder,
  Gift,
  Globe,
  Hyperlink,
  InputPassword,
  Users2,
  Webhook,
} from "@dub/ui";
import { APP_DOMAIN, cn, PLANS } from "@dub/utils";
import { useState } from "react";

const PLAN_DESCRIPTIONS: Record<string, string> = {
  Free: "Unlimited static codes. 2 dynamic codes per month. 100 analytics events.",
  Base: "More dynamic codes and analytics events for growing needs.",
  Business: "Unlimited dynamic codes and analytics events for teams.",
  Advanced: "Higher limits, custom domains, and priority support.",
};

// Plans that are coming soon and cannot be upgraded to yet
const COMING_SOON_PLANS = ["business", "advanced"];

// Feature IDs to hide from the pricing page
const HIDDEN_FEATURE_IDS = [
  "payouts",
  "domains",
  "partners",
  "dotlink",
  "flexiblerewards",
  "embeddedreferrals",
  "api",
];

const plans = PLANS.filter((p) =>
  ["Free", "Base", "Business", "Advanced"].includes(p.name),
);

const enterprisePlan = PLANS.find((p) => p.name === "Enterprise")!;

export function PricingPlans() {
  const [period, setPeriod] = useState<"monthly" | "yearly">("yearly");

  return (
    <div className="mt-12">
      {/* Plan Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const isPopular = plan.name === "Business";
          const isFree = plan.name === "Free";
          const features = (plan.features || [])
            .filter((f) => !HIDDEN_FEATURE_IDS.includes(f.id || ""))
            .slice(0, 6);
          const isComingSoon = COMING_SOON_PLANS.includes(
            plan.name.toLowerCase(),
          );

          return (
            <div
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-xl border bg-white p-6",
                isPopular
                  ? "border-neutral-900 ring-1 ring-neutral-900"
                  : "border-neutral-200",
              )}
            >
              {/* Plan Header */}
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    {plan.name}
                  </h3>
                  {isPopular && (
                    <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-xs font-medium text-white">
                      POPULAR
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="mt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-semibold text-neutral-900">
                      {isFree ? "$0" : `$${plan.price[period]?.toFixed(2)}`}
                    </span>
                    <span className="text-sm text-neutral-500">
                      {isFree ? "forever" : "per month"}
                    </span>
                  </div>
                </div>

                {/* Billing Toggle */}
                {!isFree && (
                  <button
                    type="button"
                    onClick={() =>
                      setPeriod(period === "monthly" ? "yearly" : "monthly")
                    }
                    className="mt-2 flex items-center gap-2 text-sm"
                  >
                    <span
                      className={cn(
                        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                        period === "yearly"
                          ? "bg-neutral-900"
                          : "bg-neutral-200",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block size-3.5 transform rounded-full bg-white transition-transform",
                          period === "yearly"
                            ? "translate-x-5"
                            : "translate-x-1",
                        )}
                      />
                    </span>
                    <span className="text-neutral-700">Billed yearly</span>
                    {period === "yearly" && (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                        2 months free
                      </span>
                    )}
                  </button>
                )}

                {isFree && (
                  <p className="mt-2 text-sm text-neutral-500">
                    No credit card required
                  </p>
                )}
              </div>

              {/* Description */}
              <p className="mb-4 text-sm text-neutral-600">
                {PLAN_DESCRIPTIONS[plan.name]}
              </p>

              {/* CTA Button */}
              {isComingSoon ? (
                <button
                  type="button"
                  disabled
                  className="mb-6 flex items-center justify-center rounded-lg bg-blue-100 px-4 py-2.5 text-sm font-semibold text-blue-600"
                >
                  Coming Soon
                </button>
              ) : (
                <a
                  href={`${APP_DOMAIN}/register?next=/onboarding/qr-landing`}
                  className={cn(
                    "mb-6 flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                    isPopular
                      ? "bg-neutral-900 text-white hover:bg-neutral-800"
                      : "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
                  )}
                >
                  Get started
                </a>
              )}

              {/* Features List */}
              <ul className="flex flex-col gap-3">
                {features.map((feature, fidx) => {
                  const IconComponent = getFeatureIcon(feature.id);
                  return (
                    <FeatureItem key={fidx} icon={IconComponent}>
                      {feature.text}
                    </FeatureItem>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Enterprise Section */}
      <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-neutral-900">
              Enterprise
            </h3>
            <p className="mt-1 text-sm text-neutral-600">
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
              <CircleHalfDottedClock className="size-4 text-neutral-400" />
              <span>Unlimited retention</span>
            </div>
            <div className="flex items-center gap-2">
              <Users2 className="size-4 text-neutral-400" />
              <span>Custom SLA</span>
            </div>
          </div>
          <a
            href="mailto:support@foreverqrs.com"
            className="flex items-center justify-center whitespace-nowrap rounded-lg border border-neutral-200 bg-white px-6 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50"
          >
            Contact us
          </a>
        </div>
      </div>

      {/* Cancellation Explanation */}
      <div className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-center">
        <h3 className="text-lg font-semibold text-neutral-900">
          What happens if I cancel or downgrade?
        </h3>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-neutral-600">
          Your codes keep redirecting. That never changes. Your analytics event
          limit adjusts to your new plan. If your codes get more scans than your
          plan includes, you&apos;ll see partial data until you upgrade.
        </p>
      </div>
    </div>
  );
}

function getFeatureIcon(
  featureId?: string,
): React.ComponentType<{ className?: string }> {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    scans: ChartLine,
    codes: Hyperlink,
    retention: CircleHalfDottedClock,
    domains: Globe,
    users: Users2,
    folders: Folder,
    dotlink: Gift,
    deeplinks: Hyperlink,
    events: ChartLine,
    webhooks: Webhook,
    roles: InputPassword,
    advanced: Gift,
    ai: Gift,
    payouts: Gift,
    partners: Users2,
    tests: ChartLine,
    flexiblerewards: Gift,
    embeddedreferrals: Hyperlink,
    messages: Users2,
    api: Webhook,
    slack: Users2,
    qr: Gift,
  };
  return iconMap[featureId || ""] || Check;
}

function FeatureItem({
  children,
  icon: Icon,
}: {
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <li className="flex items-start gap-2 text-sm text-neutral-600">
      <Icon className="mt-0.5 size-4 shrink-0 text-neutral-400" />
      <span>{children}</span>
    </li>
  );
}
