import { Grid } from "@dub/ui";
import { APP_DOMAIN, cn, createHref, UTMTags } from "@dub/utils";
import { ReactNode } from "react";
import { ButtonLink } from "./button-link";
import Logos from "./logos";

// Stat highlights for social proof
const STATS = [
  {
    value: "99.9%",
    label: "Uptime SLA",
  },
  {
    value: "1M+",
    label: "QR Scans",
  },
  {
    value: "500+",
    label: "Brands",
  },
];

export function CTA({
  domain,
  utmParams,
  title = "Print QR codes you can trust",
  subtitle = "Guaranteed longevity with transparent pricing. Your QR codes never expire, and your scan data belongs to you—no hidden fees, no surprises.",
  className,
}: {
  domain: string;
  utmParams?: Partial<Record<(typeof UTMTags)[number], string>>;
  title?: ReactNode;
  subtitle?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto mb-20 mt-12 w-full max-w-screen-lg overflow-hidden rounded-2xl bg-neutral-50 px-6 pb-16 pt-10 text-center sm:mt-0 sm:px-0 sm:px-12",
        className,
      )}
    >
      <Grid
        cellSize={80}
        patternOffset={[1, -20]}
        className="inset-[unset] left-1/2 top-0 w-[1200px] -translate-x-1/2 text-neutral-200 [mask-image:linear-gradient(black_50%,transparent)]"
      />
      <div className="absolute -left-1/4 -top-1/2 h-[135%] w-[150%] opacity-5 blur-[130px] [transform:translate3d(0,0,0)]">
        <div className="size-full bg-[conic-gradient(from_-66deg,#855AFC_-32deg,#f00_63deg,#EAB308_158deg,#5CFF80_240deg,#855AFC_328deg,#f00_423deg)] [mask-image:radial-gradient(closest-side,black_100%,transparent_100%)]" />
      </div>

      <div className="relative mx-auto my-8 flex w-fit gap-12 sm:gap-16">
        {STATS.map(({ value, label }, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center"
          >
            <div className="text-3xl font-semibold text-neutral-900 sm:text-4xl">
              {value}
            </div>
            <p className="mt-2 text-sm text-neutral-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="relative mx-auto mt-1.5 flex w-full max-w-xl flex-col items-center">
        <h2 className="font-display text-balance text-4xl font-medium text-neutral-900 sm:text-[2.5rem] sm:leading-[1.15]">
          {title}
        </h2>
        <p className="mt-5 text-balance text-base text-neutral-500 sm:text-xl">
          {subtitle}
        </p>
      </div>

      <div className="relative mx-auto mt-10 flex max-w-fit space-x-4">
        <ButtonLink variant="primary" href={`${APP_DOMAIN}/register`}>
          Get Started
        </ButtonLink>
        <ButtonLink
          variant="secondary"
          href={createHref("/tools/qr-code", domain, {
            utm_source: "Custom Domain",
            utm_medium: "Welcome Page",
            utm_campaign: domain,
            utm_content: "Try Free QR Generator",
          })}
        >
          Try Free QR Generator
        </ButtonLink>
      </div>

      <div className="relative">
        <Logos
          domain={domain}
          utmParams={utmParams}
          className="mb-0 mt-8 max-w-screen-md"
        />
      </div>
    </div>
  );
}
