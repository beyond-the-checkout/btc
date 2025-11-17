"use client";

import { LinkLandingQRCreator } from "@/ui/modals/link-landing-qr-modal";
import { CTA } from "@/ui/placeholders/cta";
import { FeaturesSection } from "@/ui/placeholders/features-section";
import { Hero } from "@/ui/placeholders/hero";
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
            Dynamic QR codes that never expire
          </h1>
          <p
            className={cn(
              "mt-3 max-w-3xl text-balance text-center text-sm text-neutral-700 sm:text-base",
              "animate-slide-up-fade motion-reduce:animate-fade-in [--offset:10px] [animation-delay:200ms] [animation-duration:1s] [animation-fill-mode:both]",
            )}
          >
            Checkout delivers guaranteed longevity for your QR codes with
            transparent pricing and no hidden fees. Your scan data belongs to
            you—update anytime without reprinting.
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
      <div className="mt-20">
        <FeaturesSection domain={domain} utmParams={UTM_PARAMS} />
      </div>
      <div className="mt-32">
        <CTA domain={domain} utmParams={UTM_PARAMS} />
      </div>
    </div>
  );
}
