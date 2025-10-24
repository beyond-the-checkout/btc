"use client";

/**
 * Webhook creation CTA.
 *
 * Deployment feature flags (`@/lib/feature-flags`) determine whether webhooks
 * exist for a deployment, while plan capabilities (`@/lib/plan-capabilities`)
 * continue to manage workspace-level access. Use this component as the
 * canonical example for combining both systems inside client UI.
 */
import { clientAccessCheck } from "@/lib/api/tokens/permissions";
import { getPlanCapabilities } from "@/lib/plan-capabilities";
import { isFeatureEnabled } from "@/lib/feature-flags";
import useWorkspace from "@/lib/swr/use-workspace";
import { Button } from "@dub/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CreateWebhookButton() {
  const pathname = usePathname();
  const webhooksEnabled = isFeatureEnabled("webhooks");

  const { slug, plan, role } = useWorkspace();

  const { canCreateWebhooks } = getPlanCapabilities(plan);

  if (!webhooksEnabled) {
    // Deployment flag disables webhooks globally, so omit client CTA entirely.
    return null;
  }

  const { error: permissionsError } = clientAccessCheck({
    action: "webhooks.write",
    role: role,
  });

  // Plan gating + canonical URL check (deployment flag handled above).
  if (!canCreateWebhooks || !pathname.endsWith("/settings/webhooks")) {
    return null;
  }

  return (
    <Link href={`/${slug}/settings/webhooks/new`}>
      <Button
        className="flex h-10 items-center justify-center whitespace-nowrap rounded-lg border px-4 text-sm"
        text="Create Webhook"
        disabledTooltip={permissionsError}
      />
    </Link>
  );
}
