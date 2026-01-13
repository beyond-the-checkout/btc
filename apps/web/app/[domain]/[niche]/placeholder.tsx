import { getNicheConfig } from "@/lib/niches";
import { CTA } from "@/ui/placeholders/cta";
import { FaqSection } from "@/ui/placeholders/faq-section";
import { FeaturesSection } from "@/ui/placeholders/features-section";
import { Hero } from "@/ui/placeholders/hero";
import { HowItWorksSection } from "@/ui/placeholders/how-it-works";
import Logos from "@/ui/placeholders/logos";
import { PainSection } from "@/ui/placeholders/pain-section";
import { PricingSection } from "@/ui/placeholders/pricing-section";
import { SolutionSection } from "@/ui/placeholders/solution-section";
import { QRCreatorClient } from "./qr-creator-client";

import { cn, NicheSlug } from "@dub/utils";

type NichePlaceholderContentProps = {
  domain: string;
  niche: string;
};

export default function NichePlaceholderContent({
  domain,
  niche,
}: NichePlaceholderContentProps) {
  const config = getNicheConfig(niche as NicheSlug);

  if (!config) {
    return null;
  }

  const utmParams = {
    utm_source: "Custom Domain",
    utm_medium: "Niche Landing",
    utm_campaign: niche,
  };

  return (
    <div>
      <Hero>
        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center">
          <h1
            className={cn(
              "font-display mt-4 text-center text-3xl font-medium text-neutral-900 sm:text-4xl sm:leading-tight",
            )}
          >
            {config.hero.headline}
          </h1>
          <p
            className={cn(
              "mt-3 max-w-3xl text-balance text-center text-sm text-neutral-700 sm:text-base",
            )}
          >
            {config.hero.subheadline}
          </p>
          <div className={cn("mt-8 flex flex-col items-center")}>
            <QRCreatorClient ctaText={config.hero.ctaText} />
            {config.hero.belowCtaText && (
              <p className="mt-3 text-sm text-neutral-500 sm:text-base">
                {config.hero.belowCtaText}
              </p>
            )}
          </div>
        </div>
      </Hero>

      {config.pain && <PainSection config={config.pain} />}

      {config.solution && <SolutionSection config={config.solution} />}

      {config.howItWorks && (
        <HowItWorksSection
          domain={domain}
          utmParams={utmParams}
          config={config.howItWorks}
        />
      )}

      {config.logos.copy !== null && (
        <Logos
          domain={domain}
          utmParams={utmParams}
          copy={config.logos.copy ?? undefined}
          className="mt-16"
        />
      )}

      <div className="mt-12">
        <FeaturesSection
          domain={domain}
          utmParams={utmParams}
          overrides={config.features}
          sectionTitle={config.featuresSectionTitle}
        />
      </div>

      <PricingSection config={config.pricing} />

      <FaqSection config={config.faq} />

      <div className="mt-32">
        <CTA
          domain={domain}
          utmParams={utmParams}
          title={config.cta.title}
          subtitle={config.cta.subtitle}
          ctaText={config.cta.ctaText}
          belowCtaText={config.cta.belowCtaText}
        />
      </div>
    </div>
  );
}
