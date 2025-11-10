"use client";

import { useBillingUsage, useTagsCount, useUsers, useWorkspace } from "@/lib/swr-lf";
import usePartnersCount from "@/lib/swr/use-partners-count";
import SubscriptionMenuLF from "@/ui/workspaces/subscription-menu-lf";
import { buttonVariants, useRouterStuff } from "@dub/ui";
import {
  CirclePercentage,
  CreditCard,
  CrownSmall,
  CursorRays,
  Folder5,
  Globe,
  Hyperlink,
  Icon,
  Tag,
  Users,
  Users6,
} from "@dub/ui/icons";
import {
  capitalize,
  cn,
  getFirstAndLastDay,
  INFINITY_NUMBER,
  nFormatter,
} from "@dub/utils";
import { isLegacyBusinessPlan } from "@dub/utils/src/constants/pricing";
import NumberFlow from "@number-flow/react";
import Link from "next/link";
import { CSSProperties, useMemo } from "react";
import { UsageChartLF } from "./usage-chart-lf";

export default function PlanUsageLF() {
  const {
    slug,
    plan,
    stripeId,
    defaultProgramId,
    usage,
    usageLimit,
    linksUsage,
    linksLimit,
    totalLinks,
    payoutsUsage,
    payoutsLimit,
    payoutFee,
    domains,
    domainsLimit,
    foldersUsage,
    foldersLimit,
    groupsLimit,
    tagsLimit,
    usersLimit,
    billingCycleStart,
  } = useWorkspace();

  const { partnersCount } = usePartnersCount<number>({
    programId: defaultProgramId ?? undefined,
    status: "approved",
  });

  const { data: tags } = useTagsCount();
  const { users } = useUsers();

  const [billingStart, billingEnd] = useMemo(() => {
    if (billingCycleStart) {
      const { firstDay, lastDay } = getFirstAndLastDay(billingCycleStart);
      const start = firstDay.toLocaleDateString("en-us", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const end = lastDay.toLocaleDateString("en-us", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return [start, end];
    }
    return [];
  }, [billingCycleStart]);

  const usageTabs = useMemo(() => {
    const tabs = [
      {
        id: "events",
        icon: CursorRays,
        title: "Events tracked",
        usage: usage,
        limit: usageLimit,
      },
      {
        id: "links",
        icon: Hyperlink,
        title: "Links created",
        usage: linksUsage,
        limit: linksLimit,
      },
    ];
    if (totalLinks && totalLinks > 10_000) {
      // Find the links tab and move it to the first position
      const linksTabIndex = tabs.findIndex((tab) => tab.id === "links");
      if (linksTabIndex !== -1) {
        const linksTab = tabs.splice(linksTabIndex, 1)[0];
        tabs.unshift(linksTab);
      }
    }
    return tabs;
  }, [plan, usage, usageLimit, linksUsage, linksLimit, totalLinks]);

  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      <div className="flex flex-col items-start justify-between gap-y-4 p-6 md:px-8 lg:flex-row">
        <div>
          <h2 className="text-xl font-medium">
            {plan && isLegacyBusinessPlan({ plan, payoutsLimit })
              ? "Business (Legacy)"
              : capitalize(plan)}{" "}
            Plan
          </h2>
          {billingStart && billingEnd && (
            <p className="mt-1.5 text-balance text-sm font-medium leading-normal text-neutral-700">
              <>
                Current billing cycle:{" "}
                <span className="font-normal">
                  {billingStart} - {billingEnd}
                </span>
              </>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {plan !== "enterprise" && (
            <Link
              href={`/${slug}/settings/billing/upgrade`}
              className={cn(
                buttonVariants({ variant: "primary" }),
                "flex h-9 w-full items-center justify-center whitespace-nowrap rounded-md border px-4 text-sm",
              )}
            >
              Upgrade
            </Link>
          )}
          <Link
            href={`/${slug}/settings/billing/invoices`}
            className={cn(
              buttonVariants({ variant: "secondary" }),
              "flex h-9 w-full items-center justify-center whitespace-nowrap rounded-md border px-4 text-sm",
            )}
          >
            View invoices
          </Link>
          {stripeId && plan !== "free" && <SubscriptionMenuLF />}
        </div>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] divide-y divide-neutral-200 border-t border-neutral-200">
        <div>
          <div className="grid gap-4 p-6 sm:grid-cols-2 md:p-8 lg:gap-6">
            {usageTabs.map((tab) => (
              <UsageTabCard key={tab.id} {...tab} />
            ))}
          </div>
          <div className="w-full px-2 pb-8 md:px-8">
            <UsageChartLF />
          </div>
        </div>
        <div
          className={cn(
            "grid grid-cols-1 gap-[1px] overflow-hidden rounded-b-lg bg-neutral-200 md:grid-cols-3",
            "md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4",
          )}
        >
          <UsageCategory
            title="Custom Domains"
            icon={Globe}
            usage={domains?.length}
            usageLimit={domainsLimit}
          />
          <UsageCategory
            title="Folders"
            icon={Folder5}
            usage={foldersUsage}
            usageLimit={foldersLimit}
            href={`/${slug}/settings/library/folders`}
          />
          <UsageCategory
            title="Tags"
            icon={Tag}
            usage={tags}
            usageLimit={tagsLimit}
            href={`/${slug}/settings/library/tags`}
          />
          <UsageCategory
            title="Teammates"
            icon={Users}
            usage={users?.filter((user) => !user.isMachine).length}
            usageLimit={usersLimit}
            href={`/${slug}/settings/people`}
          />
        </div>
        <div className="grid grid-cols-1 gap-[1px] overflow-hidden rounded-b-lg bg-neutral-200 md:grid-cols-3">
          <UsageCategory
            title="Partners"
            icon={Users6}
            usage={partnersCount ?? 0}
            usageLimit={INFINITY_NUMBER}
            href={`/${slug}/program/partners`}
          />
          <UsageCategory
            title="Partner payouts"
            icon={CreditCard}
            usage={payoutsUsage}
            usageLimit={payoutsLimit}
            unit="$"
            href={`/${slug}/program/payouts`}
          />
          <UsageCategory
            title="Payout fees"
            icon={CirclePercentage}
            usage={plan && payoutFee && `${payoutFee * 100}%`}
            href="https://dub.co/help/article/partner-payouts#payout-fees-and-timing"
          />
        </div>
      </div>
    </div>
  );
}

function UsageTabCard({
  id,
  icon: Icon,
  title,
  usage: usageProp,
  limit: limitProp,
  unit,
}: {
  id: string;
  icon: Icon;
  title: string;
  usage?: number;
  limit?: number;
  unit?: string;
}) {
  const { searchParams, queryParams } = useRouterStuff();
  const { slug, totalLinks } = useWorkspace();

  const defaultActiveTab = useMemo(() => {
    if (totalLinks && totalLinks > 10_000) {
      return "links";
    }
    return "events";
  }, [totalLinks]);

  const isActive = useMemo(() => {
    if (searchParams.get("tab")) {
      return searchParams.get("tab") === id;
    } else {
      return id === defaultActiveTab;
    }
  }, [searchParams, id, defaultActiveTab]);

  const [usage, limit] =
    unit === "$" && usageProp !== undefined && limitProp !== undefined
      ? [usageProp / 100, limitProp / 100]
      : [usageProp, limitProp];

  const loading = usage === undefined || limit === undefined;
  const unlimited = limitProp !== undefined && limitProp >= INFINITY_NUMBER;
  const warning = !loading && !unlimited && usage >= limit * 0.9;
  const remaining = !loading && !unlimited ? Math.max(0, limit - usage) : 0;

  const prefix = unit || "";

  return (
    <button
      className={cn(
        "rounded-lg border border-neutral-300 bg-white px-4 py-3 text-left transition-colors duration-75",
        "outline-none focus-visible:border-blue-600 focus-visible:ring-1 focus-visible:ring-blue-600",
        isActive && "border-neutral-900 ring-1 ring-neutral-900",
        "hover:bg-neutral-50 lg:px-5 lg:py-4",
      )}
      aria-selected={isActive}
      onClick={() => queryParams({ set: { tab: id } })}
    >
      <Icon className="size-4 text-neutral-600" />
      <div className="mt-1.5 flex items-center gap-2 text-sm text-neutral-600">
        {title}
      </div>
      <div className="mt-2">
        {!loading ? (
          <NumberFlow
            value={usage}
            className="text-xl leading-none text-neutral-900"
            format={
              unit === "$"
                ? {
                    style: "currency",
                    currency: "USD",
                    // @ts-ignore – trailingZeroDisplay is a valid option but TS is outdated
                    trailingZeroDisplay: "stripIfInteger",
                  }
                : {
                    notation: usage < INFINITY_NUMBER ? "standard" : "compact",
                  }
            }
          />
        ) : (
          <div className="h-5 w-16 animate-pulse rounded-md bg-neutral-200" />
        )}
      </div>
      <div className="mt-5">
        <div
          className={cn(
            "h-1 w-full overflow-hidden rounded-full bg-neutral-900/10 transition-colors",
            loading && "bg-neutral-900/5",
          )}
        >
          {!loading && !unlimited && (
            <div
              className="animate-slide-right-fade size-full"
              style={{ "--offset": "-100%" } as CSSProperties}
            >
              <div
                className={cn(
                  "size-full rounded-full bg-gradient-to-r from-blue-500/80 to-blue-600",
                  warning && "from-neutral-900/10 via-red-500 to-red-600",
                )}
                style={{
                  transform: `translateX(-${100 - Math.max(Math.floor((usage / Math.max(0, usage, limit)) * 100), usage === 0 ? 0 : 1)}%)`,
                }}
              />
            </div>
          )}
        </div>
      </div>
      <div className="mt-2 leading-none">
        {!loading ? (
          <span className="text-xs leading-none text-neutral-600">
            {unlimited
              ? "Unlimited"
              : `${prefix}${nFormatter(remaining, { full: true })} remaining of ${prefix}${nFormatter(limit, { full: limit < INFINITY_NUMBER })}`}
          </span>
        ) : (
          <div className="h-4 w-20 animate-pulse rounded-md bg-neutral-200" />
        )}
      </div>
      {warning && (
        <div className="mt-2 text-xs text-red-600">
          You've reached 90% of your monthly limit.
        </div>
      )}
    </button>
  );
}

function UsageCategory(data: {
  title: string;
  icon: Icon;
  usage?: number | string;
  usageLimit?: number;
  href?: string;
  unit?: string;
}) {
  let { title, icon: Icon, usage, usageLimit, unit, href } = data;

  const As = href ? Link : "div";

  return (
    <As
      className={cn(
        "flex flex-col justify-between gap-4 bg-white p-6 md:px-8",
        href && "transition-colors hover:bg-neutral-50",
      )}
      href={href ?? "#"}
      {...(href?.startsWith("http") && { target: "_blank" })}
    >
      <div className="flex cursor-default items-center gap-2 text-neutral-800">
        <Icon className="size-4 shrink-0" />
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-800">
        {usage || usage === 0 ? (
          <p>
            {typeof usage === "number"
              ? `${unit ?? ""}${nFormatter(usage / (unit === "$" ? 100 : 1), {
                  full: true,
                })}`
              : usage}
          </p>
        ) : (
          <div className="size-5 animate-pulse rounded-md bg-neutral-200" />
        )}
        {usageLimit !== undefined && (
          <>
            <span>/</span>
            <p className="text-neutral-500">
              {usageLimit && usageLimit >= INFINITY_NUMBER
                ? "∞"
                : `${unit ?? ""}${nFormatter(
                    usageLimit / (unit === "$" ? 100 : 1),
                    {
                      full: true,
                    },
                  )}`}
            </p>
          </>
        )}
      </div>
    </As>
  );
}
