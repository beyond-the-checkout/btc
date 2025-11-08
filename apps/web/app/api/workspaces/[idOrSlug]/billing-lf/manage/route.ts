import { withWorkspace } from "@/lib/auth";
import { getProvider } from "@/lib/billing-lf/provider";
import { APP_DOMAIN } from "@dub/utils";
import { NextResponse } from "next/server";

/**
 * POST /api/workspaces/[idOrSlug]/billing-lf/manage
 *
 * Opens the billing portal in management mode
 */
export const POST = withWorkspace(async ({ workspace }) => {
  const provider = getProvider();

  const { redirectUrl } = await provider.createPortalSession({
    workspaceId: workspace.id,
    workspaceSlug: workspace.slug,
    returnUrl: `${APP_DOMAIN}/${workspace.slug}/settings/billing`,
    mode: "manage",
  });

  return NextResponse.json({ redirectUrl });
});
