/**
 * Shared utility to create a workspace for a user.
 * Used by the workspace API route and the QR bootstrap route.
 */
import { generateRandomString } from "@/lib/api/utils/generate-random-string";
import { createWorkspaceId } from "@/lib/api/workspaces/create-workspace-id";
import { generateRandomName } from "@/lib/names";
import { storage } from "@/lib/storage";
import { PlanProps } from "@/lib/types";
import { subscribe } from "@dub/email/resend/subscribe";
import { prisma } from "@dub/prisma";
import { Prisma } from "@dub/prisma/client";
import { chkoLog, FREE_WORKSPACES_LIMIT, nanoid, R2_URL } from "@dub/utils";
import slugify from "@sindresorhus/slugify";
import { waitUntil } from "@vercel/functions";

export type CreateWorkspaceResult = {
  id: string;
  slug: string;
  plan: PlanProps;
};

export type CreateWorkspaceOptions = {
  userId: string;
  name?: string;
  slug?: string;
  logo?: string;
  /** User info for logging/subscriptions */
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    defaultWorkspace?: string | null;
  };
};

/**
 * Create a workspace for a user.
 * If name/slug are not provided, generates a random name.
 *
 * @throws Error if the user has exceeded the free workspace limit
 * @throws Error if the slug is already taken (P2002)
 */
export async function createWorkspaceForUser(
  opts: CreateWorkspaceOptions,
): Promise<CreateWorkspaceResult> {
  const { userId, user } = opts;
  let { name, slug, logo } = opts;

  // Generate name and slug if not provided
  if (!name) {
    name = generateRandomName();
  }
  if (!slug) {
    slug = slugify(name);
  }

  // Only upload to R2 if logo is base64-encoded; remote URLs are stored directly
  const isBase64Logo = logo?.startsWith("data:image/");

  let uploadedImageUrl: string | undefined;

  const workspace = await prisma.$transaction(
    async (tx) => {
      const freeWorkspaces = await tx.project.count({
        where: {
          plan: "free",
          users: {
            some: {
              userId,
              role: "owner",
            },
          },
        },
      });

      if (freeWorkspaces >= FREE_WORKSPACES_LIMIT) {
        throw new Error(
          `You can only create up to ${FREE_WORKSPACES_LIMIT} free workspaces. Additional workspaces require a paid plan.`,
        );
      }

      const workspaceId = createWorkspaceId();
      // For base64 logos, generate R2 URL; for remote URLs, use as-is
      uploadedImageUrl = logo
        ? isBase64Logo
          ? `${R2_URL}/workspaces/${workspaceId}/logo_${nanoid(7)}`
          : logo
        : undefined;

      return await tx.project.create({
        data: {
          id: workspaceId,
          name,
          slug,
          logo: uploadedImageUrl,
          users: {
            create: {
              userId,
              role: "owner",
              notificationPreference: {
                create: {},
              },
            },
          },
          billingCycleStart: new Date().getDate(),
          invoicePrefix: generateRandomString(8),
          inviteCode: nanoid(24),
          defaultDomains: {
            create: {},
          },
        },
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 5000,
      timeout: 5000,
    },
  );

  // Background tasks
  waitUntil(
    Promise.allSettled([
      // Send Slack notification for new free signup
      chkoLog({
        message: `*New Free signup (QR landing)!*\n• Name: ${user?.name || "Unknown"}\n• Email: ${user?.email || "Unknown"}`,
        type: "signups",
      }),
      // If the user has no default workspace, set the new workspace as the default
      user?.defaultWorkspace === null &&
        prisma.user.update({
          where: { id: userId },
          data: { defaultWorkspace: workspace.slug },
        }),
      // Subscribe the user to the app.chko.sh Resend audience
      user?.email &&
        subscribe({
          email: user.email,
          name: user.name || undefined,
          audience: "app.chko.sh",
        }),
      // Upload logo to R2 if base64-encoded
      isBase64Logo &&
        logo &&
        uploadedImageUrl &&
        storage.upload(uploadedImageUrl.replace(`${R2_URL}/`, ""), logo),
    ]),
  );

  return {
    id: workspace.id,
    slug: workspace.slug,
    plan: workspace.plan as PlanProps,
  };
}
