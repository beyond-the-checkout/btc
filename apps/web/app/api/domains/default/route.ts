import { withWorkspace } from "@/lib/auth";
import z from "@/lib/zod";
import { getDefaultDomainsQuerySchema } from "@/lib/zod/schemas/domains";
import { prisma } from "@dub/prisma";
import { DUB_DOMAINS_ARRAY, LEGACY_SHORT_DOMAIN } from "@dub/utils";
import { NextResponse } from "next/server";

// Central mapping so we don't rely on fragile string replacement.
// Keep dubsh mapped to legacy chko.sh forever.
const DEFAULT_DOMAIN_COLUMN_TO_SLUG: Record<string, string> = {
  dubsh: LEGACY_SHORT_DOMAIN, // legacy: chko.sh (stable mapping)
  foreverqrs: "foreverqrs.com", // new primary short-link domain
  dublink: "dub.link",
  chatgpt: "chatg.pt",
  sptifi: "spti.fi",
  gitnew: "git.new",
  callink: "cal.link",
  amznid: "amzn.id",
  ggllink: "ggl.link",
  figpage: "fig.page",
};

// GET /api/domains/default - get default domains
export const GET = withWorkspace(
  async ({ workspace, searchParams }) => {
    const { search } = getDefaultDomainsQuerySchema.parse(searchParams);

    const data = await prisma.defaultDomains.findUnique({
      where: {
        projectId: workspace.id,
      },
      select: {
        dubsh: true,
        foreverqrs: true,
        dublink: true,
        chatgpt: true,
        sptifi: true,
        gitnew: true,
        callink: true,
        amznid: true,
        ggllink: true,
        figpage: true,
      },
    });

    let defaultDomains: string[] = [];

    if (data) {
      defaultDomains = Object.entries(data)
        .filter(([, enabled]) => enabled)
        .map(([column]) => DEFAULT_DOMAIN_COLUMN_TO_SLUG[column])
        .filter(Boolean) // defensive: prevent nulls
        .filter((slug) => DUB_DOMAINS_ARRAY.includes(slug)) // only return domains that exist in DUB_DOMAINS
        .filter((domain) =>
          search ? domain?.toLowerCase().includes(search.toLowerCase()) : true,
        );
    }

    return NextResponse.json(defaultDomains);
  },
  {
    requiredPermissions: ["domains.read"],
  },
);

const updateDefaultDomainsSchema = z.object({
  defaultDomains: z.array(z.enum(DUB_DOMAINS_ARRAY as [string, ...string[]])),
});

// PATCH /api/domains/default - edit default domains
export const PATCH = withWorkspace(
  async ({ req, workspace }) => {
    const { defaultDomains } = await updateDefaultDomainsSchema.parseAsync(
      await req.json(),
    );

    const response = await prisma.defaultDomains.update({
      where: {
        projectId: workspace.id,
      },
      data: {
        dubsh: defaultDomains.includes(LEGACY_SHORT_DOMAIN), // legacy chko.sh (stable mapping)
        foreverqrs: defaultDomains.includes("foreverqrs.com"),
        dublink: defaultDomains.includes("dub.link"),
        chatgpt: defaultDomains.includes("chatg.pt"),
        sptifi: defaultDomains.includes("spti.fi"),
        gitnew: defaultDomains.includes("git.new"),
        callink: defaultDomains.includes("cal.link"),
        amznid: defaultDomains.includes("amzn.id"),
        ggllink: defaultDomains.includes("ggl.link"),
        figpage: defaultDomains.includes("fig.page"),
      },
    });

    return NextResponse.json(response);
  },
  {
    requiredPermissions: ["domains.write"],
  },
);
