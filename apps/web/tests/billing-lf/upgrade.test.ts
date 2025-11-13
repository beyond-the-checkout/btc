import { UpgradeResponse, UpgradeResponseT } from "@/lib/billing-lf/types";
import { APP_DOMAIN } from "@dub/utils";
import { describe, expect, test } from "vitest";
import { IntegrationHarness } from "../utils/integration";

/**
 * Tests for POST /api/workspaces/[idOrSlug]/billing-lf/upgrade
 *
 * Tests cover:
 * - Security: baseUrl domain validation
 * - Portal vs checkout flow detection
 * - Schema validation using Zod
 *
 * Note: These tests require E2E environment variables:
 * - E2E_BASE_URL
 * - E2E_TOKEN
 * - E2E_TOKEN_OLD
 * - E2E_PUBLISHABLE_KEY
 */

// Skip if E2E environment is not configured
const skipE2E = !process.env.E2E_BASE_URL;

describe.skipIf(skipE2E).sequential("POST /billing-lf/upgrade", async () => {
  const h = new IntegrationHarness();
  const { workspace, http } = await h.init();
  const slug = workspace.slug;

  test("rejects invalid baseUrl (security check)", async () => {
    const { status, data } = await http.post<{ error: { message: string } }>({
      path: `/workspaces/${slug}/billing-lf/upgrade`,
      body: {
        plan: "business",
        period: "monthly",
        baseUrl: "https://evil.com/",
        onboarding: undefined,
      },
    });

    expect(status).toEqual(422);
    expect(data.error).toBeDefined();
    expect(data.error.message).toContain("Invalid");
  });

  test("accepts valid APP_DOMAIN baseUrl", async () => {
    const { status, data } = await http.post<UpgradeResponseT>({
      path: `/workspaces/${slug}/billing-lf/upgrade`,
      body: {
        plan: "business",
        period: "monthly",
        baseUrl: `${APP_DOMAIN}/${slug}/settings/billing-lf`,
        onboarding: undefined,
      },
    });

    // Should succeed with 200
    expect(status).toEqual(200);

    // Should return either redirectUrl or sessionId (normalized response)
    expect(
      data.redirectUrl !== undefined || data.sessionId !== undefined,
    ).toBeTruthy();

    // Validate response schema
    expect(() => UpgradeResponse.parse(data)).not.toThrow();

    // Response shape should be mutually exclusive
    if (data.redirectUrl) {
      expect(data.redirectUrl).toMatch(/^https:\/\//);
      expect(data.sessionId).toBeUndefined();
      // Note: We can't reliably force portal vs checkout without knowing subscription state
    }

    if (data.sessionId) {
      expect(typeof data.sessionId).toBe("string");
      expect(data.sessionId.length).toBeGreaterThan(0);
      expect(data.redirectUrl).toBeUndefined();
    }
  });

  test("supports onboarding parameter", async () => {
    const { status, data } = await http.post<UpgradeResponseT>({
      path: `/workspaces/${slug}/billing-lf/upgrade`,
      body: {
        plan: "base",
        period: "yearly",
        baseUrl: `${APP_DOMAIN}/${slug}/settings/billing-lf`,
        onboarding: "signup",
      },
    });

    expect(status).toEqual(200);
    expect(() => UpgradeResponse.parse(data)).not.toThrow();
  });

  test("validates plan tier enum", async () => {
    const { status, data } = await http.post<{ error: { message: string } }>({
      path: `/workspaces/${slug}/billing-lf/upgrade`,
      body: {
        plan: "invalid-plan",
        period: "monthly",
        baseUrl: `${APP_DOMAIN}/${slug}/settings/billing-lf`,
      },
    });

    expect(status).toEqual(422);
    expect(data.error).toBeDefined();
    expect(data.error.message).toContain("Invalid");
  });

  test("validates billing period enum", async () => {
    const { status, data } = await http.post<{ error: { message: string } }>({
      path: `/workspaces/${slug}/billing-lf/upgrade`,
      body: {
        plan: "business",
        period: "invalid-period",
        baseUrl: `${APP_DOMAIN}/${slug}/settings/billing-lf`,
      },
    });

    expect(status).toEqual(422);
    expect(data.error).toBeDefined();
    expect(data.error.message).toContain("Invalid");
  });
});
