import { DubApiError, handleAndReturnErrorResponse } from "@/lib/api/errors";
import { verifyQstashSignature } from "@/lib/cron/verify-qstash";
import { sendEmail } from "@dub/email";
import { subscribe } from "@dub/email/resend";
import WelcomeEmailPartner from "@dub/email/templates/welcome-email-partner";
import { prisma } from "@dub/prisma";
import { Redis } from "@upstash/redis";
import { z } from "zod";

// Brevo list ID for welcome sequence - must be explicitly configured
// Production: 3, Staging: 6
const BREVO_WELCOME_LIST_ID = process.env.BREVO_WELCOME_LIST_ID
  ? parseInt(process.env.BREVO_WELCOME_LIST_ID, 10)
  : null;

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

      if (isPartner) {
        // Partners: Use existing Resend flow
        const audience = "partners.foreverqrs.com";

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
          }
        }

        await sendEmail({
          to: user.email,
          subject: "Welcome to ForeverQRs Partners!",
          react: WelcomeEmailPartner({ name: user.name, email: user.email }),
          variant: "marketing",
        });

        return new Response(
          `Welcome email sent to partner ${user.email}`,
        );
      }

      // Non-partners: Add to Brevo welcome sequence list
      // The Brevo automation will handle the 5-email nurture series
      const brevoApiKey = process.env.BREVO_API_KEY;
      if (!brevoApiKey) {
        // No API key - log and skip (useful for local development)
        // Clear dedupe key so user can be processed when API key is configured
        if (redis && dedupeLocked && dedupeKey) {
          await redis.del(dedupeKey);
        }
        console.log(
          `[Brevo] Skipping - no API key configured. Would add ${user.email} to welcome sequence`,
        );
        return new Response(
          `Brevo API key not configured - skipped adding ${user.email} to welcome sequence`,
          { status: 200 },
        );
      }

      if (!BREVO_WELCOME_LIST_ID) {
        throw new DubApiError({
          code: "internal_server_error",
          message: "BREVO_WELCOME_LIST_ID not configured",
        });
      }

      const firstName = user.name?.split(" ")[0] || "";

      const brevoResponse = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: {
          "api-key": brevoApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          attributes: { FIRSTNAME: firstName },
          listIds: [BREVO_WELCOME_LIST_ID],
          updateEnabled: true,
        }),
      });

      if (!brevoResponse.ok) {
        const errorText = await brevoResponse.text();
        console.error(
          `Brevo API error for ${user.email}: ${brevoResponse.status} ${errorText}`,
        );
        // Don't throw - contact may already exist, which is fine
        if (brevoResponse.status !== 400) {
          throw new DubApiError({
            code: "internal_server_error",
            message: `Brevo API error: ${brevoResponse.status}`,
          });
        }
      }

      return new Response(
        `Added ${user.email} to Brevo welcome sequence (list ${BREVO_WELCOME_LIST_ID})`,
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
