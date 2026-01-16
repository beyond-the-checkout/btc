import { PostHog } from "posthog-node";

type EventProperties = Record<string, any>;

const POSTHOG_HOST = "https://us.posthog.com";

let posthogClient: PostHog | null = null;

function getPosthogClient(): PostHog | null {
  const apiKey = process.env.POSTHOG_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!apiKey) {
    return null;
  }

  if (!posthogClient) {
    posthogClient = new PostHog(apiKey, {
      host: POSTHOG_HOST,
      flushAt: 1,
      flushInterval: 0,
    });
  }

  return posthogClient;
}

export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties: EventProperties = {},
): Promise<void> {
  const client = getPosthogClient();
  if (!client) return;

  try {
    const mergedProperties = {
      ...properties,
      ...(properties.source ? {} : { source: "server" }),
      $lib: "posthog-node",
    };

    await client.capture({
      distinctId,
      event,
      properties: mergedProperties,
    });
  } catch (error) {
    console.error("PostHog capture failed", { event, error });
  }
}

export async function flushPostHog(): Promise<void> {
  const client = getPosthogClient();
  if (!client) return;

  try {
    await client.flush();
  } catch (error) {
    console.error("PostHog flush failed", { error });
  }
}
