import { PaymentMethodSummary } from "@/lib/billing-lf/types";
import { describe, expect, test } from "vitest";
import { IntegrationHarness } from "../utils/integration";

/**
 * Tests for GET/POST /api/workspaces/[idOrSlug]/billing-lf/payment-methods
 *
 * Tests cover:
 * - GET: List payment methods, direct debit ordering
 * - POST: Add payment method flow
 * - Policy enforcement: SEPA restricted to enterprise plans
 * - Schema validation using Zod
 *
 * Note: These tests require E2E environment variables to be configured.
 */

// Skip if E2E environment is not configured
const skipE2E = !process.env.E2E_BASE_URL;

describe.skipIf(skipE2E).sequential("GET /billing-lf/payment-methods", async () => {
  const h = new IntegrationHarness();
  const { workspace, http } = await h.init();
  const slug = workspace.slug;

  test("returns array of payment methods", async () => {
    const { status, data } = await http.get<
      Array<{ id: string; type: string }>
    >({
      path: `/workspaces/${slug}/billing-lf/payment-methods`,
    });

    expect(status).toEqual(200);
    expect(Array.isArray(data)).toBe(true);

    // Note: May be empty for new workspaces without any payment methods
    // Validate schema for each payment method when present
    if (data.length > 0) {
      data.forEach((pm) => {
        expect(() => PaymentMethodSummary.parse(pm)).not.toThrow();
      });
    }
  });

  test("direct debit appears first when present", async () => {
    const { status, data } = await http.get<
      Array<{ id: string; type: string; isDirectDebit: boolean }>
    >({
      path: `/workspaces/${slug}/billing-lf/payment-methods`,
    });

    expect(status).toEqual(200);

    // If there are payment methods and at least one is direct debit
    const hasDirectDebit = data.some((pm) => pm.isDirectDebit);
    if (hasDirectDebit && data.length > 1) {
      // First item should be direct debit
      expect(data[0].isDirectDebit).toBe(true);
    }

    // If there is no direct debit present, document and ensure first is not DD
    if (!hasDirectDebit && data.length > 0) {
      // Note: May be no direct debit for some workspaces
      expect(data[0].isDirectDebit).toBe(false);
    }
  });

  test("includes required fields", async () => {
    const { status, data } = await http.get<
      Array<{
        id: string;
        type: string;
        isDirectDebit: boolean;
        connected: boolean;
        displayName: string;
      }>
    >({
      path: `/workspaces/${slug}/billing-lf/payment-methods`,
    });

    expect(status).toEqual(200);

    // Note: May be empty if workspace has no methods yet
    if (data.length > 0) {
      const first = data[0];
      expect(first.id).toBeDefined();
      expect(first.type).toBeDefined();
      expect(typeof first.isDirectDebit).toBe("boolean");
      expect(typeof first.connected).toBe("boolean");
      expect(first.displayName).toBeDefined();
      expect(first.displayName.length).toBeGreaterThan(0);
    }
  });
});

describe.skipIf(skipE2E).sequential("POST /billing-lf/payment-methods", async () => {
  const h = new IntegrationHarness();
  const { workspace, http } = await h.init();
  const slug = workspace.slug;

  test("returns redirectUrl for adding payment method", async () => {
    const { status, data } = await http.post<{ redirectUrl: string }>({
      path: `/workspaces/${slug}/billing-lf/payment-methods`,
      body: {
        method: "card",
      },
    });

    expect(status).toEqual(200);
    expect(data.redirectUrl).toBeDefined();
    expect(typeof data.redirectUrl).toBe("string");
    expect(data.redirectUrl).toMatch(/^https:\/\//);
  });

  test("supports us_bank_account method", async () => {
    const { status, data } = await http.post<{ redirectUrl: string }>({
      path: `/workspaces/${slug}/billing-lf/payment-methods`,
      body: {
        method: "us_bank_account",
      },
    });

    expect(status).toEqual(200);
    expect(data.redirectUrl).toBeDefined();
  });

  test("enforces SEPA policy for non-enterprise plans", async () => {
    // Only test if workspace is not enterprise
    // Fetch workspace plan to decide expectation deterministically
    const wsRes = await http.get<{ plan: string }>({ path: `/workspaces/${slug}` });
    const wsPlan = wsRes.data?.plan;

    if (wsPlan !== "enterprise") {
      const { status, data } = await http.post<{ error: { message: string } }>(
        {
          path: `/workspaces/${slug}/billing-lf/payment-methods`,
          body: {
            method: "sepa_debit",
          },
        },
      );

      expect(status).toEqual(403);
      expect(data.error).toBeDefined();
      expect(data.error.message).toContain("enterprise");
    }
  });

  test("allows SEPA for enterprise workspaces (when applicable)", async () => {
    const wsRes = await http.get<{ plan: string }>({ path: `/workspaces/${slug}` });
    const wsPlan = wsRes.data?.plan;

    if (wsPlan === "enterprise") {
      const { status, data } = await http.post<{ redirectUrl: string }>({
        path: `/workspaces/${slug}/billing-lf/payment-methods`,
        body: {
          method: "sepa_debit",
        },
      });

      expect(status).toEqual(200);
      expect(data.redirectUrl).toBeDefined();
      expect(typeof data.redirectUrl).toBe("string");
      expect(data.redirectUrl).toMatch(/^https:\/\//);
    }
  });

  test("allows portal flow without method", async () => {
    const { status, data } = await http.post<{ redirectUrl: string }>({
      path: `/workspaces/${slug}/billing-lf/payment-methods`,
      body: {},
    });

    expect(status).toEqual(200);
    expect(data.redirectUrl).toBeDefined();
  });

  test("validates payment method enum", async () => {
    const { status, data } = await http.post<{ error: { message: string } }>({
      path: `/workspaces/${slug}/billing-lf/payment-methods`,
      body: {
        method: "invalid-method",
      },
    });

    expect(status).toEqual(422);
    expect(data.error).toBeDefined();
    expect(data.error.message).toContain("Invalid");
  });
});
