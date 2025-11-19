import { UserProps } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { isValidInternalRedirect, parse } from "./utils";
import { getDefaultWorkspace } from "./utils/get-default-workspace";
import { getDubProductFromCookie } from "./utils/get-dub-product-from-cookie";
import { isTopLevelSettingsRedirect } from "./utils/is-top-level-settings-redirect";

export default async function WorkspacesMiddleware(
  req: NextRequest,
  user: UserProps,
) {
  const { path, searchParamsObj, searchParamsString } = parse(req);

  const isSafeMethod = req.method === "GET" || req.method === "HEAD";

  // Handle ?next= query param with proper validation to prevent open redirects
  // Apply only on safe methods to avoid method-preserving redirects of POST/RSC
  if (
    isSafeMethod &&
    searchParamsObj.next &&
    isValidInternalRedirect(searchParamsObj.next, req.url)
  ) {
    const current = new URL(req.url);
    const resolvedNext = new URL(searchParamsObj.next, current);

    // Build final URL:
    // - Keep current non-'next' params (e.g., source)
    // - Merge any params present inside the 'next' value (do not overwrite existing)
    const finalUrl = new URL(current);
    finalUrl.pathname = resolvedNext.pathname;

    // Remove the control param
    finalUrl.searchParams.delete("next");

    // Merge query params from the next destination without overwriting
    for (const [k, v] of resolvedNext.searchParams.entries()) {
      if (!finalUrl.searchParams.has(k)) {
        finalUrl.searchParams.set(k, v);
      }
    }

    return NextResponse.redirect(finalUrl);
  }

  const defaultWorkspace = await getDefaultWorkspace(user);

  if (defaultWorkspace) {
    let redirectPath = path;
    if (["/", "/login", "/register", "/workspaces"].includes(path)) {
      redirectPath = "";
    } else if (isTopLevelSettingsRedirect(path)) {
      redirectPath = `/settings/${path}`;
    }

    if (!redirectPath) {
      // Determine product from cookie (default to links)
      const product = await getDubProductFromCookie(defaultWorkspace);
      redirectPath = `/${product}`;
    }

    return NextResponse.redirect(
      new URL(
        `/${defaultWorkspace}${redirectPath}${searchParamsString}`,
        req.url,
      ),
    );
  } else {
    return NextResponse.redirect(new URL("/onboarding/workspace", req.url));
  }
}
