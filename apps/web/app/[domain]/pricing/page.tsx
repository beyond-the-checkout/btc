"use client";

import { APP_DOMAIN } from "@dub/utils";
import { PricingPlans } from "./pricing-plans";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-4xl font-medium italic tracking-tight text-neutral-900 sm:text-5xl">
          Flexible plans that
          <br />
          grow with you
        </h1>
        <p className="mt-6 text-lg text-neutral-600">
          Start for free, no credit card required.
          <br />
          Upgrade when you need a plan that fits your needs.
        </p>
      </div>

      {/* Pricing Plans */}
      <PricingPlans />

      {/* Free Plan Banner */}
      <div className="mt-8 flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-6 py-5">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Free</h3>
          <p className="text-sm text-neutral-600">
            <span className="font-semibold text-neutral-900">$0</span> free
            forever – the most generous free plan on the market
          </p>
        </div>
        <a
          href={`${APP_DOMAIN}/register`}
          className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 shadow-sm transition-colors hover:bg-neutral-50"
        >
          Start for free
        </a>
      </div>
    </div>
  );
}
