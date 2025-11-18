import { setOnboardingProgress } from "@/lib/actions/set-onboarding-progress";
import { QR_ONBOARDING_SOURCE_PARAM } from "@/lib/onboarding/qr";
import { OnboardingStep } from "@/lib/onboarding/types";
import useWorkspace from "@/lib/swr/use-workspace";
import { useAction } from "next-safe-action/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";

const PRE_WORKSPACE_STEPS = ["workspace"];

export function useOnboardingProgress() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { slug: workspaceSlug } = useWorkspace();
  const slug = workspaceSlug || searchParams.get("workspace");
  const source = searchParams.get(QR_ONBOARDING_SOURCE_PARAM);

  const { execute, executeAsync, isPending, hasSucceeded } = useAction(
    setOnboardingProgress,
    {
      onSuccess: () => {
        console.log("Onboarding progress updated");
      },
      onError: ({ error }) => {
        toast.error("Failed to update onboarding progress. Please try again.");
        console.error("Failed to update onboarding progress", error);
      },
    },
  );

  const continueTo = useCallback(
    async (
      step: OnboardingStep,
      {
        slug: providedSlug,
        params,
      }: { slug?: string; params?: Record<string, string> } = {},
    ) => {
      execute({
        onboardingStep: step,
      });

      const queryParams = new URLSearchParams({
        ...(params || {}),
        ...(PRE_WORKSPACE_STEPS.includes(step)
          ? {}
          : { workspace: (providedSlug || slug)! }),
        ...(source ? { [QR_ONBOARDING_SOURCE_PARAM]: source } : {}),
      });

      router.push(`/onboarding/${step}?${queryParams}`);
    },
    [execute, router, slug, source],
  );

  const finish = useCallback(async () => {
    await executeAsync({
      onboardingStep: "completed",
    });

    if (slug) {
      const base = `/${slug}/links?onboarded=true`;
      router.push(
        source ? `${base}&${QR_ONBOARDING_SOURCE_PARAM}=${source}` : base,
      );
    } else {
      router.push("/");
    }
  }, [execute, router, slug, source]);

  return {
    continueTo,
    finish,
    isLoading: isPending,
    isSuccessful: hasSucceeded,
  };
}
