"use client";

import { getNicheConfig } from "@/lib/niches";
import { LinkLandingQRCreator } from "@/ui/modals/link-landing-qr-modal";
import { CTA } from "@/ui/placeholders/cta";
import { FeaturesSection } from "@/ui/placeholders/features-section";
import { Hero } from "@/ui/placeholders/hero";
import Logos from "@/ui/placeholders/logos";
import { cn, NicheSlug } from "@dub/utils";
import { useParams } from "next/navigation";

export default function NichePlaceholderContent() {
  const { domain, niche } = useParams() as { domain: string; niche: string };

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
              "animate-slide-up-fade motion-reduce:animate-fade-in [--offset:20px] [animation-duration:1s] [animation-fill-mode:both]",
            )}
          >
            {config.hero.headline}
          </h1>
          <p
            className={cn(
              "mt-3 max-w-3xl text-balance text-center text-sm text-neutral-700 sm:text-base",
              "animate-slide-up-fade motion-reduce:animate-fade-in [--offset:10px] [animation-delay:200ms] [animation-duration:1s] [animation-fill-mode:both]",
            )}
          >
            {config.hero.subheadline}
          </p>
          <div
            className={cn(
              "mt-8",
              "animate-slide-up-fade motion-reduce:animate-fade-in [--offset:5px] [animation-delay:400ms] [animation-duration:1s] [animation-fill-mode:both]",
            )}
          >
            <LinkLandingQRCreator ctaText={config.hero.ctaText} />
          </div>
        </div>
      </Hero>
      {config.logos.copy !== null && (
        <Logos
          domain={domain}
          utmParams={utmParams}
          copy={config.logos.copy ?? undefined}
          className="mt-8"
        />
      )}
      <div className="mt-12">
        <FeaturesSection
          domain={domain}
          utmParams={utmParams}
          overrides={config.features}
        />
      </div>
      <div className="mt-32">
        <CTA
          domain={domain}
          utmParams={utmParams}
          title={config.cta.title}
          subtitle={config.cta.subtitle}
        />
      </div>
    </div>
  );
}
