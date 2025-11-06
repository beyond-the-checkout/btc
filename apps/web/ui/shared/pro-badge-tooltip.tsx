import useWorkspace from "@/lib/swr/use-workspace";
import { BadgeTooltip, InfoTooltip, type TooltipProps } from "@dub/ui";
import { Crown } from "lucide-react";

/**
 * A dynamic badge/icon w/ tooltip based on the workspace plan:
 *
 * For a free workspace: a "Base" badge
 * For a Base workspace: an info icon (question mark circle)
 */
export function BaseBadgeTooltip(props: Omit<TooltipProps, "children">) {
  const { plan } = useWorkspace();

  return plan === "free" ? (
    <BadgeTooltip {...props}>
      <div className="flex items-center space-x-1">
        <Crown size={12} />
        <p className="uppercase">Base</p>
      </div>
    </BadgeTooltip>
  ) : (
    <InfoTooltip {...props} />
  );
}
