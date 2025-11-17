"use client";

import { RegisterDomainForm } from "@/ui/domains/register-domain-form";
import { LaterButton } from "../../../later-button";
import { useOnboardingProgress } from "../../../use-onboarding-progress";

export function Form() {
  const { continueTo } = useOnboardingProgress();

  return (
    <div>
      <RegisterDomainForm
        saveOnly
        onSuccess={() => {
          continueTo("completed");
        }}
      />
      <LaterButton next="completed" className="mt-4" />
    </div>
  );
}
