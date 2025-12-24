import {
  ApiMiddleware,
  AppMiddleware,
  AxiomMiddleware,
  CreateLinkMiddleware,
  LinkMiddleware,
} from "@/lib/middleware";
import { parse } from "@/lib/middleware/utils";
import {
  API_HOSTNAMES,
  APP_HOSTNAMES,
  DEFAULT_REDIRECTS,
  isMarketingDomain,
  isNicheSlug,
  isValidUrl,
} from "@dub/utils";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { supportedWellKnownFiles } from "./lib/well-known";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api/ routes
     * 2. /_next/ (Next.js internals)
     * 3. /_proxy/ (proxies for third-party services)
     * 4. /logos/ (static logo files)
     * 5. Metadata files: favicon.ico, sitemap.xml, robots.txt, manifest.webmanifest
     */
    "/((?!api/|_next/|_proxy/|logos/|favicon.ico|sitemap.xml|robots.txt|manifest.webmanifest).*)",
  ],
};

export default async function middleware(req: NextRequest, ev: NextFetchEvent) {
  const { domain, path, key, fullKey } = parse(req);

  AxiomMiddleware(req, ev);

  // for App
  if (APP_HOSTNAMES.has(domain)) {
    return AppMiddleware(req);
  }

  // for API
  if (API_HOSTNAMES.has(domain)) {
    return ApiMiddleware(req);
  }

  // for public stats pages (e.g. d.to/stats/try)
  if (path.startsWith("/stats/")) {
    return NextResponse.rewrite(new URL(`/${domain}${path}`, req.url));
  }

  // for public marketing pages (pricing, customers, landing page)
  if (path === "/pricing" || path === "/customers" || path === "/") {
    return NextResponse.rewrite(new URL(`/${domain}${path}`, req.url));
  }

  const potentialNiche = path.slice(1).split("/")[0];
  if (isMarketingDomain(domain) && isNicheSlug(potentialNiche)) {
    return NextResponse.rewrite(
      new URL(`/${domain}/${potentialNiche}`, req.url),
    );
  }

  // for legal pages (TOS and Privacy Policy)
  if (path === "/tos" || path === "/privacy-policy") {
    return NextResponse.next();
  }

  // for .well-known routes
  if (path.startsWith("/.well-known/")) {
    const file = path.split("/.well-known/").pop();
    if (file && supportedWellKnownFiles.includes(file)) {
      return NextResponse.rewrite(
        new URL(`/wellknown/${domain}/${file}`, req.url),
      );
    }
  }

  // default redirects for dub.sh
  if (domain === "dub.sh" && DEFAULT_REDIRECTS[key]) {
    return NextResponse.redirect(DEFAULT_REDIRECTS[key]);
  }

  if (isValidUrl(fullKey)) {
    return CreateLinkMiddleware(req);
  }

  return LinkMiddleware(req, ev);
}
