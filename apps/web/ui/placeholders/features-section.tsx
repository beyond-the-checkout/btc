import { FeatureOverride } from "@/lib/niches";
import { ExpandingArrow } from "@dub/ui";
import { cn, UTMTags } from "@dub/utils";
import Link from "next/link";
import { PropsWithChildren } from "react";
import Markdown from "react-markdown";
import { Analytics } from "./feature-graphics/analytics";
import { Domains } from "./feature-graphics/domains";
import { Personalization } from "./feature-graphics/personalization";
import { QR } from "./feature-graphics/qr";
import { QRCustomization } from "./feature-graphics/qr-customization";

type BaseFeature = Pick<FeatureOverride, "id" | "graphic"> & {
  title: string;
  description: string;
};

const DEFAULT_FEATURES: BaseFeature[] = [
  {
    id: "domains",
    title: "Never expires",
    description:
      "No arbitrary expiration dates. No surprise shutdowns. Once created, your QR code works indefinitely. Even if you cancel your account.",
  },
  {
    id: "qr",
    title: "Update anytime",
    description:
      "Change where your code points whenever you want. New menu? New landing page? Update the destination. The printed code stays the same.",
  },
  {
    id: "analytics",
    title: "Real-time analytics",
    description:
      "See scans as they happen. Geographic data. Device types. Time trends. Free includes 100 events per month. Pro includes 10,000.",
  },
  {
    id: "personalization",
    title: "Custom domains",
    description:
      "Use your own domain for branded short links. Your QR codes, your brand. No ForeverQRs branding required.",
  },
  {
    id: "qr-customization",
    title: "Fully customizable design",
    description:
      "Match your brand. Dot patterns, corner styles, colors, frames, logos. Pixel-perfect at any scale.",
  },
  {
    id: "data-export",
    title: "Your data is yours",
    description:
      "Full CSV export of all your codes, destinations, and scan analytics. Export anytime. No lock-in.",
  },
];

const mergeFeatures = (overrides?: FeatureOverride[]): BaseFeature[] => {
  const overrideMap = new Map(
    (overrides ?? []).map((override) => [override.id, override]),
  );

  return DEFAULT_FEATURES.map((feature) => {
    const override = overrideMap.get(feature.id);
    return {
      ...feature,
      ...(override?.title ? { title: override.title } : {}),
      ...(override?.description ? { description: override.description } : {}),
      ...(override?.graphic ? { graphic: override.graphic } : {}),
    };
  });
};

export function FeaturesSection({
  domain,
  utmParams,
  overrides,
  sectionTitle = "QR codes built for businesses that print on real things",
}: {
  domain: string;
  utmParams: Partial<Record<(typeof UTMTags)[number], string>>;
  overrides?: FeatureOverride[];
  sectionTitle?: string;
}) {
  const features = mergeFeatures(overrides);
  const getFeature = (id: FeatureOverride["id"]) =>
    features.find((feature) => feature.id === id)!;

  const domainsFeature = getFeature("domains");
  const qrFeature = getFeature("qr");
  const analyticsFeature = getFeature("analytics");
  const personalizationFeature = getFeature("personalization");
  const customizationFeature = getFeature("qr-customization");
  const dataExportFeature = getFeature("data-export");

  return (
    <div className="mt-20">
      <div className="mx-auto w-full max-w-xl px-4 text-center">
        <div className="mx-auto flex h-7 w-fit items-center rounded-full border border-neutral-200 bg-white px-4 text-xs text-neutral-800">
          Everything you need
        </div>
        <h2 className="font-display mt-2 text-balance text-3xl font-medium text-neutral-900">
          {sectionTitle}
        </h2>
        <p className="mt-3 text-pretty text-lg text-neutral-500">
          Menus. Packaging. Table tents. Signage. You print thousands of them,
          and you need codes that still work next year. And the year after that.
        </p>
      </div>
      <div className="mx-auto mt-14 grid w-full max-w-screen-lg grid-cols-1 px-4 sm:grid-cols-2">
        <div className="contents divide-neutral-200 max-sm:divide-y sm:divide-x">
          <FeatureCard
            title={domainsFeature.title}
            description={domainsFeature.description}
          >
            {domainsFeature.graphic ?? <Domains />}
          </FeatureCard>
          <FeatureCard
            title={qrFeature.title}
            description={qrFeature.description}
          >
            {qrFeature.graphic ?? <QR />}
          </FeatureCard>
        </div>

        <FeatureCard
          className="border-y border-neutral-200 pt-12 sm:col-span-2"
          graphicClassName="sm:h-96"
          title={analyticsFeature.title}
          description={analyticsFeature.description}
        >
          <a
            href="https://app.chko.sh/share/dash_1KAYTMYPYVXD77ZPYQMPQ7VF6"
            target="_blank"
            className="group block size-full"
          >
            <div className="size-full transition-[filter,opacity] duration-300 group-hover:opacity-70 group-hover:blur-[3px]">
              {analyticsFeature.graphic ?? <Analytics />}
            </div>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="text-content-emphasis flex items-center text-sm font-medium">
                View live demo <ExpandingArrow className="size-4" />
              </span>
            </div>
          </a>
        </FeatureCard>

        <div className="grid grid-cols-1 border-t border-neutral-200 sm:col-span-2 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            className="border-r-0 border-neutral-200 sm:border-r lg:border-r"
            title={personalizationFeature.title}
            description={personalizationFeature.description}
          >
            {personalizationFeature.graphic ?? <Personalization />}
          </FeatureCard>
          <FeatureCard
            className="border-r-0 border-neutral-200 lg:border-r"
            title={customizationFeature.title}
            description={customizationFeature.description}
          >
            {customizationFeature.graphic ?? <QRCustomization />}
          </FeatureCard>
          <FeatureCard
            title={dataExportFeature.title}
            description={dataExportFeature.description}
          >
            {dataExportFeature.graphic ?? <Domains />}
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
  linkText?: string;
  href?: string;
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
        {href && linkText && (
          <Link
            href={href}
            className={cn(
              "mt-6 w-fit whitespace-nowrap rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium leading-none text-neutral-900 transition-colors duration-75",
              "outline-none hover:bg-neutral-50 focus-visible:border-neutral-900 focus-visible:ring-1 focus-visible:ring-neutral-900 active:bg-neutral-100",
            )}
          >
            {linkText}
          </Link>
        )}
      </div>
    </div>
  );
}
