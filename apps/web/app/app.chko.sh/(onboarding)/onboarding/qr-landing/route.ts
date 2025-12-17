/**
 * QR Bootstrap Route Handler - PRIMARY ONBOARDING FLOW
 *
 * This is the SOLE onboarding path for all new users. The legacy multi-step
 * onboarding (workspace → usage → domain → plan → invite) is deprecated.
 *
 * ## Two Modes:
 *
 * 1. **QR Landing Flow** (with seed cookie + seedId):
 *    - User created QR on landing page → seed cookie set
 *    - Creates workspace + first dynamic link with QR design
 *    - Redirects to dashboard with `onboarded=true&source=qr-landing&qrLinkId=...`
 *    - WelcomeModal offers QR download
 *
 * 2. **Direct Signup Flow** (no seed):
 *    - User signed up directly (no QR draft)
 *    - Creates workspace only (no link)
 *    - Redirects to dashboard with `onboarded=true`
 *    - WelcomeModal shows generic welcome
 *
 * ## Entry Points:
 * - CTA buttons: `APP_DOMAIN/register?next=/onboarding/qr-landing`
 * - Email signup fallback: `/onboarding/qr-landing`
 * - OAuth callback default: `/onboarding/qr-landing`
 *
 * ## Security:
 * - CSRF protection via seedId (must match cookie)
 * - URL validation for seed destinations
 * - Stale cookies are cleared to prevent loops
 *
 * The route runs under /onboarding/* so middleware won't redirect away
 * before completion.
 *
 * @see onboarding_simplification.md for design rationale
 * @see apps/web/app/app.chko.sh/(onboarding)/onboarding/(steps)/DEPRECATED.md for legacy flow
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
import { getUrlFromString } from "@dub/utils";
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

    // 3. CSRF validation: only enforce when URL explicitly provides seedId (QR landing flow)
    // If no seedId in URL, treat as generic sign-up path (ignore any stale cookie)
    // This prevents CSRF attacks where an attacker tricks a user into
    // visiting this route - they can't know the random ID in the cookie
    const requestUrl = new URL(req.url);
    const urlSeedId = requestUrl.searchParams.get("seedId");
    if (urlSeedId && seed?.id && urlSeedId !== seed.id) {
      console.error("CSRF validation failed: seedId mismatch", {
        urlSeedId,
        cookieSeedId: seed.id,
      });
      // Clear cookie and redirect to / - middleware will route appropriately
      const hostname = new URL(req.url).hostname;
      const cookieOpts = getServerCookieOptions(hostname);
      const response = NextResponse.redirect(new URL("/", origin));
      response.cookies.delete({
        name: QR_ONBOARDING_SEED_COOKIE,
        ...cookieOpts,
      });
      return response;
    }

    // Determine if this is the QR landing flow (has seedId) or generic sign-up (no seedId)
    const isQrLandingFlow = !!urlSeedId && !!seed?.url;

    // If not the QR landing flow (no seedId or no seed URL), this is the generic sign-up path
    // Still create workspace if needed, mark onboarding complete, but don't create a link
    if (!isQrLandingFlow) {
      // Log if seedId present but seed missing (stale/mismatched cookie scenario)
      if (urlSeedId && !seed?.url) {
        console.warn(
          "seedId in URL but no valid seed cookie - treating as sign-up path",
          {
            urlSeedId,
            hasSeedCookie: !!seedCookie?.value,
          },
        );
      }
      // Get or create workspace
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          image: true,
          defaultWorkspace: true,
        },
      });

      let workspaceSlug = user?.defaultWorkspace;

      if (!workspaceSlug) {
        // Create a workspace for the user
        try {
          const newWorkspace = await createWorkspaceForUser({
            userId,
            user: {
              name: user?.name,
              email: user?.email,
              image: user?.image,
              defaultWorkspace: user?.defaultWorkspace,
            },
          });
          workspaceSlug = newWorkspace.slug;
        } catch (error) {
          console.error("Failed to create workspace for sign-up path:", error);
          // Clear stale cookie and redirect to / - middleware will route appropriately
          const hostname = new URL(req.url).hostname;
          const cookieOpts = getServerCookieOptions(hostname);
          const response = NextResponse.redirect(new URL("/", origin));
          response.cookies.delete({
            name: QR_ONBOARDING_SEED_COOKIE,
            ...cookieOpts,
          });
          return response;
        }
      }

      // Mark onboarding complete
      await redis.set(`onboarding-step:${userId}`, "completed");

      // Clear any stale QR seed cookie to avoid carrying it forward
      const hostname = new URL(req.url).hostname;
      const cookieOpts = getServerCookieOptions(hostname);
      const response = NextResponse.redirect(
        new URL(`/${workspaceSlug}/links?onboarded=true`, origin),
      );
      response.cookies.delete({
        name: QR_ONBOARDING_SEED_COOKIE,
        ...cookieOpts,
      });
      return response;
    }

    // 4. Validate seed URL to prevent injection of malformed URLs
    const validUrl = getUrlFromString(seed.url);
    if (!validUrl) {
      console.error("Invalid seed URL:", seed.url);
      // Clear cookie and redirect to / - middleware will route appropriately
      const hostname = new URL(req.url).hostname;
      const cookieOpts = getServerCookieOptions(hostname);
      const response = NextResponse.redirect(new URL("/", origin));
      response.cookies.delete({
        name: QR_ONBOARDING_SEED_COOKIE,
        ...cookieOpts,
      });
      return response;
    }

    // 5. Determine target workspace
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
        // Clear cookie and redirect to / - middleware will route appropriately
        const hostname = new URL(req.url).hostname;
        const cookieOpts = getServerCookieOptions(hostname);
        const response = NextResponse.redirect(new URL("/", origin));
        response.cookies.delete({
          name: QR_ONBOARDING_SEED_COOKIE,
          ...cookieOpts,
        });
        return response;
      }
    }

    // 6. Create the first dynamic link with QR design
    // Convert QR design to link fields and sanitize based on plan
    const qrFields = sanitizeQrFieldsForPlan(
      qrDesignToLinkQRFields(seed.qrDesign),
      workspace.plan,
    );

    // Process and create the link
    const processedResult = await processLink({
      payload: {
        url: validUrl,
        ...qrFields,
      },
      workspace: { id: workspace.id, plan: workspace.plan },
      userId,
    });

    if (processedResult.error !== null) {
      console.error("Failed to process link:", processedResult.error);
      // Create a basic link without QR customization on error
      const fallbackResult = await processLink({
        payload: { url: validUrl },
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

      // 7. Verify link is fully committed before redirect
      await prisma.$queryRaw`SELECT 1 FROM Link WHERE id = ${link.id}`;

      // 8. Mark onboarding complete
      await redis.set(`onboarding-step:${userId}`, "completed");

      // 9. Clear the seed cookie and redirect
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

    // 7. Verify link is fully committed before redirect
    // This guards against potential read-replica lag in PlanetScale/Vitess
    // where the WelcomeModal might fetch the link before it's visible
    await prisma.$queryRaw`SELECT 1 FROM Link WHERE id = ${link.id}`;

    // 8. Mark onboarding complete
    await redis.set(`onboarding-step:${userId}`, "completed");

    // 9. Clear the seed cookie and redirect to dashboard
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
    // On any unexpected error, clear cookie and redirect to / - middleware will route appropriately
    try {
      const hostname = new URL(req.url).hostname;
      const cookieOpts = getServerCookieOptions(hostname);
      const response = NextResponse.redirect(new URL("/", origin));
      response.cookies.delete({
        name: QR_ONBOARDING_SEED_COOKIE,
        ...cookieOpts,
      });
      return response;
    } catch {
      // If cookie clearing fails, still redirect
      return NextResponse.redirect(new URL("/", origin));
    }
  }
}
