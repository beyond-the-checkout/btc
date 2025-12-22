"use client";

import { PricingPlans } from "./pricing-plans";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-4xl font-medium italic tracking-tight text-neutral-900 sm:text-5xl">
          Simple pricing
        </h1>
        <p className="mt-6 text-lg text-neutral-600">
          Redirects are forever. Analytics are metered.
          <br />
          Start for free, no credit card required.
        </p>
      </div>

      {/* Pricing Plans */}
      <PricingPlans />
    </div>
  );
}
