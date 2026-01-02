import { HowItWorksSection as HowItWorksSectionConfig } from "@/lib/niches";
import { ButtonLink } from "./button-link";
import { APP_DOMAIN, createHref, UTMTags } from "@dub/utils";

export function HowItWorksSection({
  domain,
  utmParams,
  config,
}: {
  domain: string;
  utmParams?: Partial<Record<(typeof UTMTags)[number], string>>;
  config?: HowItWorksSectionConfig;
}) {
  if (!config) {
    return null;
  }

  const { header, steps, ctaText } = config;

  if (!header && !(steps?.length)) {
    return null;
  }

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
    <section className="mx-auto mt-16 w-full max-w-screen-lg px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        {header && (
          <h2 className="font-display text-balance text-3xl font-medium text-content-default sm:text-4xl">
            {header}
          </h2>
        )}
      </div>

      {steps?.length ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, idx) => (
            <div
              key={`${step.title}-${idx}`}
              className="flex h-full flex-col gap-3 rounded-2xl border border-neutral-200 bg-subtle px-6 py-6 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
                  {idx + 1}
                </div>
                <h3 className="text-lg font-medium text-content-default">
                  {step.title}
                </h3>
              </div>
              <p className="text-base leading-relaxed text-content-subtle">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {ctaText && (
        <div className="mt-12 flex justify-center">
          <ButtonLink variant="primary" href={registerHref}>
            {ctaText}
          </ButtonLink>
        </div>
      )}
    </section>
  );
}