export function logOnboardingError(
  name: string,
  context: Record<string, unknown>,
  err: unknown,
): void {
  try {
    const redactEmail = (val: unknown): unknown => {
      if (typeof val === "string") {
        // Redact domain part of any email-like strings
        return val.replace(/@[^@\s]+/g, "@***");
      }
      return val;
    };

    const safeContext: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(context || {})) {
      if (typeof value === "string") {
        safeContext[key] = redactEmail(value);
      } else if (Array.isArray(value)) {
        safeContext[key] = value.map(redactEmail);
      } else {
        safeContext[key] = value;
      }
    }

    const errorInfo: Record<string, unknown> = {};
    if (err instanceof Error) {
      errorInfo.name = err.name;
      errorInfo.message = err.message;
      if (err.stack) {
        errorInfo.stack = err.stack;
      }
    } else {
      errorInfo.value = err;
    }

    // Future telemetry integration (e.g., Sentry)
    // if (typeof window !== "undefined" && (window as any).Sentry?.captureException) {
    //   (window as any).Sentry.captureException(
    //     err instanceof Error ? err : new Error(String(err)),
    //     { tags: { area: "onboarding", name }, extra: safeContext }
    //   );
    // }

    // Structured, searchable output
    console.error("[onboarding]", name, { context: safeContext, error: errorInfo });
  } catch {
    // Never throw from logger
  }
}