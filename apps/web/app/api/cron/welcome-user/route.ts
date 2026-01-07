import { DubApiError, handleAndReturnErrorResponse } from "@/lib/api/errors";
import { verifyQstashSignature } from "@/lib/cron/verify-qstash";
import { sendEmail } from "@dub/email";
import { subscribe } from "@dub/email/resend";
import WelcomeEmail from "@dub/email/templates/welcome-email";
import WelcomeEmailPartner from "@dub/email/templates/welcome-email-partner";
import { prisma } from "@dub/prisma";
import { Redis } from "@upstash/redis";
import { z } from "zod";

const redis = (() => {
  try {
    return Redis.fromEnv();
  } catch (error) {
    console.error(
      "Upstash Redis not configured for welcome email dedupe",
      error,
    );
    return null;
  }
})();

const WELCOME_EMAIL_DEDUP_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const WELCOME_EMAIL_CREATION_WINDOW_MS = 1000 * 60 * 10; // 10 minutes

const bodySchema = z.object({
  userId: z.string(),
});

// POST /api/cron/welcome-user – send welcome email after signup (triggered by QStash)
export const POST = async (req: Request) => {
  try {
    const rawBody = await req.text();
    await verifyQstashSignature({ req, rawBody });

    const { userId } = bodySchema.parse(JSON.parse(rawBody));

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        subscribed: true,
        defaultPartnerId: true,
        partners: {
          select: { id: true },
          take: 1,
        },
        createdAt: true,
      },
    });

    if (!user) {
      throw new DubApiError({
        code: "not_found",
        message: `User ${userId} not found`,
      });
    }

    if (!user.email) {
      throw new DubApiError({
        code: "bad_request",
        message: `User ${userId} has no email address`,
      });
    }

    const createdAtMs = user.createdAt
      ? new Date(user.createdAt).getTime()
      : null;

    if (
      createdAtMs === null ||
      createdAtMs < Date.now() - WELCOME_EMAIL_CREATION_WINDOW_MS
    ) {
      return new Response(
        `Skipping welcome email for ${user.email} (outside creation window)`,
        { status: 200 },
      );
    }

    const dedupeKey = redis ? `welcome-email-sent:${user.id}` : null;
    let dedupeLocked = false;

    if (redis && dedupeKey) {
      const dedupeResult = await redis.set(dedupeKey, "sent", {
        nx: true,
        ex: WELCOME_EMAIL_DEDUP_TTL_SECONDS,
      });

      if (dedupeResult === null) {
        return new Response(
          `Welcome email already processed for ${user.email}; skipping duplicate send.`,
          { status: 200 },
        );
      }

      dedupeLocked = true;
    }

    try {
      // Determine if user is a partner (has defaultPartnerId or any partner associations)
      const isPartner = Boolean(
        user.defaultPartnerId || (user.partners && user.partners.length > 0),
      );

      // Choose audience based on partner status
      const audience = isPartner
        ? "partners.foreverqrs.com"
        : "app.foreverqrs.com";

      // Subscribe to Resend audience (non-fatal - don't block welcome email if this fails)
      if (user.subscribed) {
        try {
          await subscribe({
            email: user.email,
            name: user.name,
            audience,
          });
        } catch (error) {
          console.error(
            `Failed to subscribe ${user.email} to ${audience}:`,
            error,
          );
          // Continue to send welcome email even if subscription fails
        }
      }

      // Send welcome email (transactional - always send regardless of subscribed status)
      // Welcome emails are considered transactional as they confirm account creation
      await sendEmail({
        to: user.email,
        subject: isPartner
          ? "Welcome to Checkout Partners!"
          : "Welcome to Checkout!",
        react: isPartner
          ? WelcomeEmailPartner({ name: user.name, email: user.email })
          : WelcomeEmail({ name: user.name, email: user.email }),
        variant: "marketing",
      });

      return new Response(
        `Welcome email sent to ${user.email} (partner: ${isPartner})`,
      );
    } catch (error) {
      if (redis && dedupeLocked && dedupeKey) {
        try {
          await redis.del(dedupeKey);
        } catch (cleanupError) {
          console.error(
            `Failed to clear welcome email dedupe key for ${user.email}:`,
            cleanupError,
          );
        }
      }
      throw error;
    }
  } catch (error) {
    return handleAndReturnErrorResponse(error);
  }
};
