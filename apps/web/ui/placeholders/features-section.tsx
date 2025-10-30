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
          Everything you need for reliable, dynamic QR codes
        </h2>
        <p className="mt-3 text-pretty text-lg text-neutral-500">
          Checkout delivers guaranteed longevity, complete data ownership, and transparent pricing for QR codes at scale. Update anytime, manage thousands, and track every scan.
        </p>
      </div>
      <div className="mx-auto mt-14 grid w-full max-w-screen-lg grid-cols-1 px-4 sm:grid-cols-2">
        <div className="contents divide-neutral-200 max-sm:divide-y sm:divide-x">
          <FeatureCard
            title="Guaranteed Longevity"
            description="Your QR codes never expire. We guarantee long-term reliability with no arbitrary expiration dates or surprise shutdowns."
            linkText="Learn more"
            href={createHref("/help/article/qr-never-expire", domain, {
              utm_campaign: domain,
              utm_content: "Learn more",
              ...utmParams,
            })}
          >
            {/* TODO: Update graphic when btc.git-89 (brand assets) is complete */}
            <Domains />
          </FeatureCard>
          <FeatureCard
            title="Easy QR Code Generation"
            description="Create QR codes in seconds with our intuitive interface. No technical knowledge required—just enter your URL and generate. Bulk creation and API access available."
            linkText="Try it now"
            href={createHref("/tools/qr-code", domain, {
              utm_campaign: domain,
              utm_content: "Try it now",
              ...utmParams,
            })}
          >
            {/* TODO: Update graphic when btc.git-89 (brand assets) is complete */}
            <QR />
          </FeatureCard>
        </div>

        <FeatureCard
          className="border-y border-neutral-200 pt-12 sm:col-span-2"
          graphicClassName="sm:h-96"
          title="Real-time analytics"
          description="Track every scan in real time with detailed analytics on QR code performance, geographic data, and device types. Monitor trends and optimize campaigns instantly."
          linkText="Explore analytics"
          href={createHref("/help/article/scan-analytics", domain, {
            utm_campaign: domain,
            utm_content: "Learn more",
            ...utmParams,
          })}
        >
          <a
            href="https://chko.sh/stats/demo"
            target="_blank"
            className="group block size-full"
          >
            {/* TODO: Update demo analytics link when available */}
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

        <div className="grid grid-cols-1 sm:col-span-2 sm:grid-cols-2 lg:grid-cols-3 border-t border-neutral-200">
          <FeatureCard
            className="border-r-0 sm:border-r lg:border-r border-neutral-200"
            title="Transparent Pricing"
            description="No hidden fees or surprise charges. Clear, upfront pricing with no arbitrary limits. You know exactly what you're paying for."
            linkText="Learn more"
            href={createHref("/help/article/pricing-plans", domain, {
              utm_campaign: domain,
              utm_content: "Learn more",
              ...utmParams,
            })}
          >
            {/* TODO: Update graphic when btc.git-89 (brand assets) is complete */}
            <Personalization />
          </FeatureCard>
          <FeatureCard
            className="border-r-0 lg:border-r border-neutral-200"
            title="Dynamic QR at scale"
            description="Update anytime, manage thousands. Create, version, and update codes per SKU or campaign—no reprint required. Variable data printing support included."
            linkText="Learn more"
            href={createHref("/help/article/dynamic-qr-codes", domain, {
              utm_campaign: domain,
              utm_content: "Learn more",
              ...utmParams,
            })}
          >
            {/* TODO: Update graphic when btc.git-89 (brand assets) is complete */}
            <Collaboration />
          </FeatureCard>
          <FeatureCard
            title="Complete Data Ownership"
            description="Your scan data belongs to you. Export anytime, full data portability, and complete control over your customer information."
            linkText="Learn more"
            href={createHref("/help/article/data-ownership", domain, {
              utm_campaign: domain,
              utm_content: "Learn more",
              ...utmParams,
            })}
          >
            {/* TODO: Update graphic when btc.git-89 (brand assets) is complete */}
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
