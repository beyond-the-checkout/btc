"use client";

import { LinkLandingQRCreator } from "@/ui/modals/link-landing-qr-modal";
import { CTA } from "@/ui/placeholders/cta";
import { FeaturesSection } from "@/ui/placeholders/features-section";
import { Hero } from "@/ui/placeholders/hero";
import Logos from "@/ui/placeholders/logos";
import { cn } from "@dub/utils";
import { useParams } from "next/navigation";

const UTM_PARAMS = {
  utm_source: "Custom Domain",
  utm_medium: "Welcome Page",
};

export default function PlaceholderContent() {
  const { domain } = useParams() as { domain: string };

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
            QR codes that work <span className="font-semibold">forever</span>.
          </h1>
          <p
            className={cn(
              "mt-3 max-w-3xl text-balance text-center text-sm text-neutral-700 sm:text-base",
              "animate-slide-up-fade motion-reduce:animate-fade-in [--offset:10px] [animation-delay:200ms] [animation-duration:1s] [animation-fill-mode:both]",
            )}
          >
            Create QR codes you can update anytime. No surprise fees. No
            &ldquo;upgrade or your codes stop working&rdquo; emails.
          </p>
          <div
            className={cn(
              "mt-8",
              "animate-slide-up-fade motion-reduce:animate-fade-in [--offset:5px] [animation-delay:400ms] [animation-duration:1s] [animation-fill-mode:both]",
            )}
          >
            <LinkLandingQRCreator />
          </div>
        </div>
      </Hero>
      <Logos domain={domain} utmParams={UTM_PARAMS} className="mt-8" />
      <div className="mt-12">
        <FeaturesSection domain={domain} utmParams={UTM_PARAMS} />
      </div>
      <div className="mt-32">
        <CTA domain={domain} utmParams={UTM_PARAMS} />
      </div>
    </div>
  );
}
