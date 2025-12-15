import { parse } from "@/lib/middleware/utils";
import { NextRequest, NextResponse } from "next/server";
import EmbedMiddleware from "./embed";
import NewLinkMiddleware from "./new-link";
import { appRedirect } from "./utils/app-redirect";
import { getDefaultWorkspace } from "./utils/get-default-workspace";
import { getOnboardingStep } from "./utils/get-onboarding-step";
import { getUserViaToken } from "./utils/get-user-via-token";
import { isTopLevelSettingsRedirect } from "./utils/is-top-level-settings-redirect";
import WorkspacesMiddleware from "./workspaces";

export default async function AppMiddleware(req: NextRequest) {
  const { path, fullPath, searchParamsString } = parse(req);

  if (path.startsWith("/embed")) {
    return EmbedMiddleware(req);
  }

  const user = await getUserViaToken(req);
  const isWorkspaceInvite =
    req.nextUrl.searchParams.get("invite") || path.startsWith("/invites/");
  const isSafeMethod = req.method === "GET" || req.method === "HEAD";

  // if there's no user and the path isn't /login or /register, redirect to /login
  if (
    !user &&
    path !== "/login" &&
    path !== "/forgot-password" &&
    path !== "/register" &&
    path !== "/auth/saml" &&
    path !== "/tos" &&
    path !== "/privacy-policy" &&
    !path.startsWith("/auth/reset-password/") &&
    !path.startsWith("/share/") &&
    !path.startsWith("/deeplink/")
  ) {
    return NextResponse.redirect(
      new URL(
        `/login${path === "/" ? "" : `?next=${encodeURIComponent(fullPath)}`}`,
        req.url,
      ),
    );

    // if there's a user
  } else if (user) {
    // /new is a special path that creates a new link (or workspace if the user doesn't have one yet)
    if (path === "/new") {
      return NewLinkMiddleware(req, user);

      /* Onboarding redirects

        - User was created less than a day ago
        - User is not invited to a workspace (redirect straight to the workspace)
        - The path does not start with /onboarding
        - The user has not completed the onboarding step
      */
    } else if (
      isSafeMethod &&
      new Date(user.createdAt).getTime() > Date.now() - 60 * 60 * 24 * 1000 &&
      !isWorkspaceInvite &&
      !["/onboarding", "/account"].some((p) => path.startsWith(p)) &&
      !(await getDefaultWorkspace(user)) &&
      (await getOnboardingStep(user)) !== "completed"
    ) {
      let step = await getOnboardingStep(user);
      if (!step) {
        return NextResponse.redirect(new URL("/onboarding", req.url));
      } else if (step === "completed") {
        return WorkspacesMiddleware(req, user);
      }

      const defaultWorkspace = await getDefaultWorkspace(user);

      if (defaultWorkspace) {
        // Skip workspace step if user already has a workspace
        step = step === "workspace" ? "link" : step;
        return NextResponse.redirect(
          new URL(`/onboarding/${step}?workspace=${defaultWorkspace}`, req.url),
        );
      } else {
        return NextResponse.redirect(new URL("/onboarding", req.url));
      }

      // if the path is / or /login or /register, redirect to the default workspace
    } else if (
      isSafeMethod &&
      ([
        "/",
        "/login",
        "/register",
        "/workspaces",
        "/links",
        "/analytics",
        "/events",
        "/customers",
        "/program",
        "/programs",
        "/settings",
        "/upgrade",
        "/guides",
        "/wrapped",
      ].includes(path) ||
        path.startsWith("/program/") ||
        path.startsWith("/settings/") ||
        isTopLevelSettingsRedirect(path))
    ) {
      // Honor `next` parameter for logged-in users on /login or /register
      // This supports the QR onboarding flow where users may already be logged in
      if (path === "/login" || path === "/register") {
        const next = req.nextUrl.searchParams.get("next");
        if (next && next.startsWith("/")) {
          return NextResponse.redirect(new URL(next, req.url));
        }
      }
      return WorkspacesMiddleware(req, user);
    }

    const appRedirectPath = await appRedirect(path);
    if (isSafeMethod && appRedirectPath) {
      return NextResponse.redirect(
        new URL(`${appRedirectPath}${searchParamsString}`, req.url),
      );
    }
  }

  // Rewrite "/[slug]/settings/billing/:path*" to "/[slug]/settings/billing-lf/:path*"
  // This provides transparent routing - URL stays as /billing but serves /billing-lf content
  const billingRegex = /^\/([^\/]+)\/settings\/billing(?:\/(.*))?$/;
  if (billingRegex.test(path)) {
    const rewritePath = path.replace(
      billingRegex,
      (_match, slug, subPath) =>
        `/${slug}/settings/billing-lf${subPath ? `/${subPath}` : ""}`,
    );
    return NextResponse.rewrite(
      new URL(`/app.chko.sh${rewritePath}${searchParamsString}`, req.url),
    );
  }

  // otherwise, rewrite the path to /app.chko.sh
  return NextResponse.rewrite(new URL(`/app.chko.sh${fullPath}`, req.url));
}
