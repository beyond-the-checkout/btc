import { logger } from "@/utils/logger";
import { z } from "zod";

export function handleError(error: unknown) {
  // Use structural check instead of instanceof to work across Zod versions
  // See: https://github.com/colinhacks/zod/issues/3429
  if (
    error &&
    typeof error === "object" &&
    "issues" in error &&
    Array.isArray((error as any).issues)
  ) {
    const zodError = error as z.ZodError;
    zodError.issues.forEach((issue) => {
      logger.error(issue.message);
    });

    process.exit(1);
  }

  if (typeof error === "string") {
    logger.error(error);
    process.exit(1);
  }

  if (error instanceof Error) {
    logger.error(error.message);
    process.exit(1);
  }

  logger.error("Something went wrong. Please try again.");
  process.exit(1);
}
