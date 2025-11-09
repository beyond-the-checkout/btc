import useIntegrations from "@/lib/swr/use-integrations";
import useWorkspace from "@/lib/swr/use-workspace";
import {
  AnimatedSizeContainer,
  CircleCheck,
  LoadingCircle,
  LoadingSpinner,
} from "@dub/ui";
import { cn } from "@dub/utils";
import Link from "next/link";
import { useEffect, useState } from "react";

export function InstallStripeIntegrationButton() {
  const { slug: workspaceSlug } = useWorkspace();

  const [isClicked, setIsClicked] = useState(false);
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null);

  const { integrations: activeIntegrations, loading } = useIntegrations({
    swrOpts: {
      revalidateOnFocus: !isEnabled,
      // Keep refreshing if the integration isn't enabled yet, most frequently if the user has clicked the button
      refreshInterval: !isEnabled ? (isClicked ? 1000 : 5000) : undefined,
    },
  });

  useEffect(() => {
    if (activeIntegrations)
      setIsEnabled(activeIntegrations.some((ai) => ai.slug === "stripe"));
  }, [activeIntegrations]);

  return (
    <AnimatedSizeContainer
      height
      transition={{ ease: "easeInOut", duration: 0.2 }}
    >
      <div
        className={cn(
          "bg-bg-subtle rounded-xl p-2 transition-colors",
          isEnabled && "bg-green-50",
        )}
      >
        {loading ? (
          <div className="flex h-4 items-center justify-center">
            <LoadingSpinner className="size-3.5" />
          </div>
        ) : isEnabled ? (
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-green-800">
            <CircleCheck className="size-3.5" />
            <span>Stripe integration installed</span>
          </div>
        ) : (
          <>
            <p className="text-content-default text-center text-xs font-medium">
              Required first step
            </p>
            <div className="text-content-inverted mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-neutral-300 px-4 text-sm font-medium cursor-not-allowed">
              Install Stripe integration (not available)
            </div>
          </>
        )}
      </div>
    </AnimatedSizeContainer>
  );
}
