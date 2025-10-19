import { ExpandingArrow } from "@dub/ui";
import { cn, createHref, UTMTags } from "@dub/utils";
import Link from "next/link";
import { PropsWithChildren } from "react";
import Markdown from "react-markdown";
import { Analytics } from "./feature-graphics/analytics";
import { Collaboration } from "./feature-graphics/collaboration";
import { Domains } from "./feature-graphics/domains";
import { Personalization } from "./feature-graphics/personalization";
import { QR } from "./feature-graphics/qr";

export function FeaturesSection({
  domain,
  utmParams,
}: {
  domain: string;
  utmParams: Partial<Record<(typeof UTMTags)[number], string>>;
}) {
  return (
    <div className="mt-20">
      <div className="mx-auto w-full max-w-xl px-4 text-center">
        <div className="mx-auto flex h-7 w-fit items-center rounded-full border border-neutral-200 bg-white px-4 text-xs text-neutral-800">
          Platform Features
        </div>
        <h2 className="font-display mt-2 text-balance text-3xl font-medium text-neutral-900">
          Everything you need to turn packages into performance media
        </h2>
        <p className="mt-3 text-pretty text-lg text-neutral-500">
          Beyond The Checkout combines dynamic QR codes, instant Bitcoin rewards, and real-time analytics to transform your packaging into an engagement channel.
        </p>
      </div>
      <div className="mx-auto mt-14 grid w-full max-w-screen-lg grid-cols-1 px-4 sm:grid-cols-2">
        <div className="contents divide-neutral-200 max-sm:divide-y sm:divide-x">
          <FeatureCard
            title="Dynamic QR at scale"
            description="Create, version, and update codes per SKU, lot, or region—no reprint required. Manage thousands of unique QR codes with variable data printing support."
            linkText="Learn more"
            href={createHref("/help/article/dynamic-qr-codes", domain, {
              utm_campaign: domain,
              utm_content: "Learn more",
              ...utmParams,
            })}
          >
            <Domains />
          </FeatureCard>
          <FeatureCard
            title="Instant Bitcoin rewards"
            description="Automated micropayments in sats via Lightning Network. We handle all crypto operations—no wallets or technical setup needed on your end."
            linkText="Try the demo"
            href={createHref("/tools/qr-code", domain, {
              utm_campaign: domain,
              utm_content: "Learn more",
              ...utmParams,
            })}
          >
            <QR />
          </FeatureCard>
        </div>

        <FeatureCard
          className="border-y border-neutral-200 pt-12 sm:col-span-2"
          graphicClassName="sm:h-96"
          title="Real-time analytics"
          description="Track scans, plays, claims, cohorts, and SKU performance. Monitor repeat purchase signals and measure campaign ROI down to the product level."
          linkText="Explore analytics"
          href={createHref("/help/article/dub-analytics", domain, {
            utm_campaign: domain,
            utm_content: "Learn more",
            ...utmParams,
          })}
        >
          <a
            href="https://d.to/stats/try"
            target="_blank"
            className="group block size-full"
          >
            <div className="size-full transition-[filter,opacity] duration-300 group-hover:opacity-70 group-hover:blur-[3px]">
              <Analytics />
            </div>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="flex items-center text-sm font-medium text-content-emphasis">
                View live demo <ExpandingArrow className="size-4" />
              </span>
            </div>
          </a>
        </FeatureCard>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-neutral-200">
          <FeatureCard
            className="border-r-0 sm:border-r lg:border-r border-neutral-200"
            title="10-second micro-games"
            description="Tap-to-win games built for mobile attention spans. Customize themes and mechanics to match your brand identity and campaign goals."
            linkText="Learn more"
            href={createHref("/help/article/micro-games", domain, {
              utm_campaign: domain,
              utm_content: "Learn more",
              ...utmParams,
            })}
          >
            <Personalization />
          </FeatureCard>
          <FeatureCard
            className="border-r-0 lg:border-r border-neutral-200"
            title="Compliance-ready"
            description="Built-in consent flows, reward limits, and regional toggles. Designed to support regulations including EU Digital Product Passport requirements."
            linkText="Learn more"
            href={createHref("/help/article/compliance", domain, {
              utm_campaign: domain,
              utm_content: "Learn more",
              ...utmParams,
            })}
          >
            <Collaboration />
          </FeatureCard>
          <FeatureCard
            title="Packaging workflow friendly"
            description="Export vector assets, variable data printing support, and printer partner integrations. Fits seamlessly into your existing packaging production process."
            linkText="Learn more"
            href={createHref("/help/article/packaging-workflow", domain, {
              utm_campaign: domain,
              utm_content: "Learn more",
              ...utmParams,
            })}
          >
            <Domains />
          </FeatureCard>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  linkText,
  href,
  children,
  className,
  graphicClassName,
}: PropsWithChildren<{
  title: string;
  description: string;
  linkText: string;
  href: string;
  className?: string;
  graphicClassName?: string;
}>) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-10 px-4 py-14 sm:px-12",
        className,
      )}
    >
      <div
        className={cn(
          "absolute left-1/2 top-1/3 h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-[50px]",
          "bg-[conic-gradient(from_270deg,#F4950C,#EB5C0C,transparent,transparent)]",
        )}
      />
      <div
        className={cn(
          "relative h-64 overflow-hidden sm:h-[302px]",
          graphicClassName,
        )}
      >
        {children}
      </div>
      <div className="relative flex flex-col">
        <h3 className="text-lg font-medium text-neutral-900">{title}</h3>
        <Markdown
          className={cn(
            "mt-2 text-neutral-500 transition-colors",
            "[&_a]:font-medium [&_a]:text-neutral-600 [&_a]:underline [&_a]:decoration-dotted [&_a]:underline-offset-2 hover:[&_a]:text-neutral-800",
          )}
          components={{
            a: ({ children, href }) => {
              if (!href) return null;
              return (
                <Link href={href} target="_blank">
                  {children}
                </Link>
              );
            },
          }}
        >
          {description}
        </Markdown>
        <Link
          href={href}
          className={cn(
            "mt-6 w-fit whitespace-nowrap rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium leading-none text-neutral-900 transition-colors duration-75",
            "outline-none hover:bg-neutral-50 focus-visible:border-neutral-900 focus-visible:ring-1 focus-visible:ring-neutral-900 active:bg-neutral-100",
          )}
        >
          {linkText}
        </Link>
      </div>
    </div>
  );
}
