"use server";

import { authUserActionClient } from "@/lib/actions/safe-action";
import { generateRandomString } from "@/lib/api/utils/generate-random-string";
import { createWorkspaceId } from "@/lib/api/workspaces/create-workspace-id";
import { prisma } from "@dub/prisma";
import { Prisma } from "@dub/prisma/client";
import { FREE_WORKSPACES_LIMIT, nanoid } from "@dub/utils";
import { z } from "zod";

/**
 * Minimal slugify for workspace names.
 */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .replace(/-{2,}/g, "-");
}

type EnsureWorkspaceResult = {
  id: string;
  slug: string;
  name: string;
};

/**
 * Ensure the current user has at least one owner workspace.
 * - If exists, return the oldest owner workspace and set as default if user has none.
 * - If not, create a free "Personal" workspace (or provided name) with proper defaults.
 */
export const ensureDefaultWorkspace = authUserActionClient
  .schema(
    z.object({
      name: z.string().optional(),
    }),
  )
  .action(async ({ ctx, parsedInput }): Promise<EnsureWorkspaceResult> => {
    const userId = ctx.user.id;
    const desiredName = (parsedInput.name || "Personal").trim();
    const baseSlug = slugify(desiredName || "Personal") || "personal";

    // 1) Check for existing owner workspace
    const [existingOwnerWorkspace, userRecord] = await Promise.all([
      prisma.project.findFirst({
        where: {
          users: {
            some: {
              userId,
              role: "owner",
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          slug: true,
          name: true,
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { defaultWorkspace: true },
      }),
    ]);

    if (existingOwnerWorkspace) {
      // Set as default workspace if user doesn't have one
      if (!userRecord?.defaultWorkspace) {
        await prisma.user.update({
          where: { id: userId },
          data: { defaultWorkspace: existingOwnerWorkspace.slug },
        });
      }
      return existingOwnerWorkspace;
    }

    // 2) Create a new workspace within a transaction, respecting FREE_WORKSPACES_LIMIT
    //    and handling slug collisions (P2002) by retrying with a suffix.
    const maxAttempts = 5;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const attemptSlug =
        attempt === 0 ? baseSlug : `${baseSlug}-${nanoid(6).toLowerCase()}`;

      try {
        const created = await prisma.$transaction(
          async (tx) => {
            // Check free workspaces limit for this user as owner
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

            const workspace = await tx.project.create({
              data: {
                id: workspaceId,
                name: desiredName,
                slug: attemptSlug,
                plan: "free",
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
              select: {
                id: true,
                slug: true,
                name: true,
              },
            });

            // Set as default workspace if user doesn't have one
            const user = await tx.user.findUnique({
              where: { id: userId },
              select: { defaultWorkspace: true },
            });

            if (!user?.defaultWorkspace) {
              await tx.user.update({
                where: { id: userId },
                data: { defaultWorkspace: workspace.slug },
              });
            }

            return workspace;
          },
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            maxWait: 5000,
            timeout: 5000,
          },
        );

        return created;
      } catch (error: unknown) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          // Unique constraint failed (likely slug). Retry with a new suffix.
          continue;
        }
        // Propagate other errors (including free limit or unexpected errors)
        throw error;
      }
    }

    // If we somehow could not produce a unique slug after retries:
    throw new Error(
      "Failed to create a workspace due to repeated slug conflicts. Please try again.",
    );
  });
