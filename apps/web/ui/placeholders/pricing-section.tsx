import { PricingSection as PricingSectionConfig } from "@/lib/niches";
import { Check } from "@dub/ui";
import { cn } from "@dub/utils";
import { ButtonLink } from "./button-link";

export function PricingSection({
  config,
}: {
  config?: PricingSectionConfig;
}) {
  if (!config) {
    return null;
  }

  const { header, intro, tiers, belowPricing } = config;

  if (!header && !(tiers?.length)) {
    return null;
  }

  return (
    <section className="mx-auto mt-16 w-full max-w-screen-lg px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        {header && (
          <h2 className="font-display text-balance text-3xl font-medium text-content-default sm:text-4xl">
            {header}
          </h2>
        )}
        {intro && (
          <p className="mt-3 text-base text-content-subtle sm:text-lg">
            {intro}
          </p>
        )}
      </div>

      {tiers?.length ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier, idx) => {
            const isFeatured =
              tier.name.toLowerCase() === "pro" || idx === 1;

            return (
              <div
                key={`${tier.name}-${idx}`}
                className={cn(
                  "flex h-full flex-col justify-between gap-6 rounded-2xl border border-neutral-200 bg-subtle px-6 py-6 shadow-sm",
                  isFeatured &&
                    "border-neutral-900 bg-white shadow-md ring-1 ring-neutral-900/10",
                )}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-content-default">
                      {tier.name}
                    </h3>
                    {isFeatured && (
                      <span className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white">
                        Most popular
                      </span>
                    )}
                  </div>
                  <p className="text-3xl font-semibold text-content-default">
                    {tier.price}
                  </p>
                  {tier.bullets?.length ? (
                    <ul className="space-y-3">
                      {tier.bullets.map((bullet, bulletIdx) => (
                        <li
                          key={`${tier.name}-bullet-${bulletIdx}`}
                          className="flex items-start gap-2 text-base leading-relaxed text-content-subtle"
                        >
                          <Check className="mt-1 size-4 text-green-600" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <div className="space-y-3">
                  <ButtonLink
                    variant="primary"
                    href={tier.ctaHref}
                    className="justify-center"
                  >
                    {tier.ctaLabel}
                  </ButtonLink>
                  {tier.note && (
                    <p className="text-sm text-content-subtle">{tier.note}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {belowPricing && (
        <div className="mt-12 rounded-2xl border border-neutral-200 bg-subtle px-6 py-6 text-center shadow-sm sm:px-10">
          <p className="text-base font-medium text-content-default sm:text-lg">
            {belowPricing}
          </p>
        </div>
      )}
    </section>
  );
}