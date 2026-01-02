import { Grid } from "@dub/ui";
import { APP_DOMAIN, cn, createHref, UTMTags } from "@dub/utils";
import { ReactNode } from "react";
import { ButtonLink } from "./button-link";

export function CTA({
  domain,
  utmParams,
  title = "Print QR codes you can trust",
  subtitle = "No ransom emails. No expiration surprises. Codes that work, forever.",
  ctaText = "Get Started",
  belowCtaText,
  className,
}: {
  domain: string;
  utmParams?: Partial<Record<(typeof UTMTags)[number], string>>;
  title?: ReactNode;
  subtitle?: ReactNode;
  ctaText?: string;
  belowCtaText?: string;
  className?: string;
}) {
  const registerHref = createHref(
    `${APP_DOMAIN}/register?next=/onboarding/qr-landing`,
    domain,
    {
      utm_source: "Custom Domain",
      utm_medium: "Niche Landing",
      utm_campaign: domain,
      ...utmParams,
    },
  );

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

      <div className="relative mx-auto mt-1.5 flex w-full max-w-xl flex-col items-center">
        <h2 className="font-display text-balance text-4xl font-medium text-neutral-900 sm:text-[2.5rem] sm:leading-[1.15]">
          {title}
        </h2>
        <p className="mt-5 text-balance text-base text-neutral-500 sm:text-xl">
          {subtitle}
        </p>
      </div>

      <div className="relative mx-auto mt-10 flex max-w-fit flex-col items-center gap-2">
        <ButtonLink variant="primary" href={registerHref}>
          {ctaText}
        </ButtonLink>
        {belowCtaText && (
          <p className="text-sm text-neutral-500 sm:text-base">
            {belowCtaText}
          </p>
        )}
      </div>
    </div>
  );
}
