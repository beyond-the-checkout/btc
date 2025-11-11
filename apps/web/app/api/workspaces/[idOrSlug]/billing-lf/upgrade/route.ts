import { DubApiError } from "@/lib/api/errors";
import { withWorkspace } from "@/lib/auth";
import { getProvider } from "@/lib/billing-lf/provider";
import { UpgradeRequest, UpgradeResponse } from "@/lib/billing-lf/types";
import { APP_DOMAIN } from "@dub/utils";
import { NextResponse } from "next/server";

/**
 * POST /api/workspaces/[idOrSlug]/billing-lf/upgrade
 *
 * License-free upgrade endpoint
 * Uses provider abstraction (currently Stripe) to handle upgrade flow
 */
export const POST = withWorkspace(async ({ req, workspace, session }) => {
  const body = await req.json();

  // Validate request body
  const parsed = UpgradeRequest.safeParse(body);
  if (!parsed.success) {
    throw new DubApiError({
      code: "unprocessable_entity",
      message: "Invalid request body",
    });
  }

  const { plan, period, baseUrl, onboarding } = parsed.data;

  // Restrict preview deployments to admins only
  if (process.env.VERCEL === "1" && process.env.VERCEL_ENV === "preview") {
    const { isDubAdmin } = await import("@/lib/auth");
    const { DUB_WORKSPACE_ID } = await import("@dub/utils");
    
    console.log("🔍 Admin Check Debug:", {
      userId: session.user.id,
      userEmail: session.user.email,
      DUB_WORKSPACE_ID,
      BEYONDTC_WORKSPACE_ID: process.env.BEYONDTC_WORKSPACE_ID,
      isPreview: process.env.VERCEL_ENV === "preview",
    });
    
    const isAdminUser = await isDubAdmin(session.user.id);
    
    console.log("🔍 isDubAdmin result:", isAdminUser);
    
    if (!isAdminUser) {
      throw new DubApiError({
        code: "unauthorized",
        message: "Unauthorized: Not an admin.",
      });
    }
  }

  // Validate baseUrl (security requirement)
  if (!baseUrl.startsWith(APP_DOMAIN)) {
    throw new DubApiError({
      code: "unprocessable_entity",
      message: "Invalid baseUrl.",
    });
  }

  // Get provider instance and create upgrade session
  const provider = getProvider();
  const result = await provider.createUpgradeSession({
    workspaceId: workspace.id,
    workspaceSlug: workspace.slug,
    currentPlan: workspace.plan,
    plan,
    period,
    baseUrl,
    onboarding,
    userId: session.user.id,
    userEmail: session.user.email,
  });

  // Validate response
  const validatedResult = UpgradeResponse.parse(result);

  return NextResponse.json(validatedResult);
});
