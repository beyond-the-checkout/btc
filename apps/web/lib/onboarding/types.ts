export const ONBOARDING_STEPS = [
  "workspace",
  "usage",
  "plan",
  "completed",
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];
