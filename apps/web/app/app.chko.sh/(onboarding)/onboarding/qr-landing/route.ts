/**
 * QR Bootstrap Route Handler
 *
 * This server-side route handles the QR landing onboarding flow:
 * 1. Reads the QR seed cookie (destination URL + QR design)
 * 2. Creates or uses existing workspace
 * 3. Creates the first dynamic link with QR design
 * 4. Marks onboarding as completed
 * 5. Redirects to dashboard with the new link ID
 *
 * The route runs under /onboarding/* so middleware won't redirect away
 * before completion.
 */
import { createLink } from "@/lib/api/links/create-link";
import { processLink } from "@/lib/api/links/process-link";
import { createWorkspaceForUser } from "@/lib/api/workspaces/create-workspace-for-user";
import { getSession } from "@/lib/auth";
import {
  getServerCookieOptions,
  parseQROnboardingSeed,
  QR_ONBOARDING_SEED_COOKIE,
} from "@/lib/onboarding/qr/seed";
import {
  qrDesignToLinkQRFields,
  sanitizeQrFieldsForPlan,
} from "@/lib/qr/design-mappers";
import { PlanProps } from "@/lib/types";
import { redis } from "@/lib/upstash";
import { prisma } from "@dub/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Get the proper origin for redirects, respecting X-Forwarded-* headers from proxies like Caddy
 */
function getRequestOrigin(req: Request): string {
  const headersList = req.headers;
  const forwardedProto = headersList.get("x-forwarded-proto") || "http";
  const forwardedHost =
    headersList.get("x-forwarded-host") || headersList.get("host");

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  // Fallback to req.url origin
  return new URL(req.url).origin;
}

export async function GET(req: Request) {
  // Get the proper origin for all redirects (respects X-Forwarded-* from proxies)
  const origin = getRequestOrigin(req);

  try {
    // 1. Get authenticated session
    const session = await getSession();
    if (!session?.user?.id) {
      // Not authenticated, redirect to login with next param to return here
      const url = new URL(req.url);
      const loginUrl = new URL("/login", origin);
      loginUrl.searchParams.set("next", url.pathname + url.search);
      return NextResponse.redirect(loginUrl);
    }

    const userId = session.user.id;

    // 2. Read QR seed from cookie
    const cookieStore = await cookies();
    const seedCookie = cookieStore.get(QR_ONBOARDING_SEED_COOKIE);
    const seed = parseQROnboardingSeed(seedCookie?.value);

    // If no seed, redirect to dashboard directly
    if (!seed?.url) {
      const defaultWorkspace = session.user.defaultWorkspace;
      if (defaultWorkspace) {
        return NextResponse.redirect(
          new URL(`/${defaultWorkspace}/links?onboarded=true`, origin),
        );
      }
      // No seed and no workspace, redirect to regular onboarding
      return NextResponse.redirect(new URL("/onboarding", origin));
    }

    // 3. Determine target workspace
    let workspace: { id: string; slug: string; plan: PlanProps } | null = null;

    // Check if user has a default workspace
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        image: true,
        defaultWorkspace: true,
      },
    });

    if (user?.defaultWorkspace) {
      // Find the default workspace
      const existingWorkspace = await prisma.project.findFirst({
        where: {
          slug: user.defaultWorkspace,
          users: {
            some: { userId },
          },
        },
        select: { id: true, slug: true, plan: true },
      });

      if (existingWorkspace) {
        workspace = {
          ...existingWorkspace,
          plan: existingWorkspace.plan as PlanProps,
        };
      }
    }

    // If no workspace found, create one
    if (!workspace) {
      try {
        workspace = await createWorkspaceForUser({
          userId,
          user: {
            name: user?.name,
            email: user?.email,
            image: user?.image,
            defaultWorkspace: user?.defaultWorkspace,
          },
        });
      } catch (error) {
        console.error("Failed to create workspace:", error);
        // Redirect to regular onboarding on failure
        return NextResponse.redirect(new URL("/onboarding", origin));
      }
    }

    // 4. Create the first dynamic link with QR design
    // Convert QR design to link fields and sanitize based on plan
    const qrFields = sanitizeQrFieldsForPlan(
      qrDesignToLinkQRFields(seed.qrDesign),
      workspace.plan,
    );

    // Process and create the link
    const processedResult = await processLink({
      payload: {
        url: seed.url,
        ...qrFields,
      },
      workspace: { id: workspace.id, plan: workspace.plan },
      userId,
    });

    if (processedResult.error !== null) {
      console.error("Failed to process link:", processedResult.error);
      // Create a basic link without QR customization on error
      const fallbackResult = await processLink({
        payload: { url: seed.url },
        workspace: { id: workspace.id, plan: workspace.plan },
        userId,
      });

      if (fallbackResult.error !== null) {
        console.error(
          "Fallback link creation also failed:",
          fallbackResult.error,
        );
        return NextResponse.redirect(
          new URL(`/${workspace.slug}/links?onboarded=true`, origin),
        );
      }

      const link = await createLink(fallbackResult.link);

      // 5. Verify link is fully committed before redirect
      await prisma.$queryRaw`SELECT 1 FROM Link WHERE id = ${link.id}`;

      // 6. Mark onboarding complete
      await redis.set(`onboarding-step:${userId}`, "completed");

      // 7. Clear the seed cookie and redirect
      const hostname = new URL(req.url).hostname;
      const cookieOpts = getServerCookieOptions(hostname);
      const response = NextResponse.redirect(
        new URL(
          `/${workspace.slug}/links?onboarded=true&source=qr-landing&qrLinkId=${link.id}`,
          origin,
        ),
      );
      response.cookies.delete({
        name: QR_ONBOARDING_SEED_COOKIE,
        ...cookieOpts,
      });
      return response;
    }

    const link = await createLink(processedResult.link);

    // 5. Verify link is fully committed before redirect
    // This guards against potential read-replica lag in PlanetScale/Vitess
    // where the WelcomeModal might fetch the link before it's visible
    await prisma.$queryRaw`SELECT 1 FROM Link WHERE id = ${link.id}`;

    // 6. Mark onboarding complete
    await redis.set(`onboarding-step:${userId}`, "completed");

    // 7. Clear the seed cookie and redirect to dashboard
    const hostname = new URL(req.url).hostname;
    const cookieOpts = getServerCookieOptions(hostname);
    const response = NextResponse.redirect(
      new URL(
        `/${workspace.slug}/links?onboarded=true&source=qr-landing&qrLinkId=${link.id}`,
        origin,
      ),
    );
    response.cookies.delete({
      name: QR_ONBOARDING_SEED_COOKIE,
      ...cookieOpts,
    });
    return response;
  } catch (error) {
    console.error("QR bootstrap route error:", error);
    // On any unexpected error, redirect to regular onboarding
    return NextResponse.redirect(new URL("/onboarding", origin));
  }
}
