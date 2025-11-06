import { PlanProps } from "@/lib/types";
import { Badge } from "@dub/ui";
import { capitalize } from "@dub/utils";

export default function PlanBadge({ plan }: { plan: PlanProps }) {
  const getVariant = () => {
    if (plan === "enterprise") return "violet";
    if (plan === "advanced") return "amber";
    if (plan.startsWith("business")) return "sky";
    if (plan === "base" || plan === "pro") return "blue";
    return "black";
  };

  return <Badge variant={getVariant()}>{capitalize(plan)}</Badge>;
}
