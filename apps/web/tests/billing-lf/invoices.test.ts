import { InvoiceItem } from "@/lib/billing-lf/types";
import { describe, expect, test } from "vitest";
import { IntegrationHarness } from "../utils/integration";

/**
 * Tests for GET /api/workspaces/[idOrSlug]/billing-lf/invoices
 *
 * Tests cover:
 * - Merged data from provider (subscription) and DB (partnerPayout, domainRenewal)
 * - Query parameter validation (type enum)
 * - Schema validation using Zod
 * - Data shape consistency across different invoice sources
 *
 * Note: These tests require E2E environment variables to be configured.
 */

// Skip if E2E environment is not configured
const skipE2E = !process.env.E2E_BASE_URL;

describe.skipIf(skipE2E).sequential("GET /billing-lf/invoices", async () => {
  const h = new IntegrationHarness();
  const { workspace, http } = await h.init();
  const slug = workspace.slug;

  test("returns subscription invoices", async () => {
    const { status, data } = await http.get<
      Array<{ id: string; source: string }>
    >({
      path: `/workspaces/${slug}/billing-lf/invoices`,
      query: { type: "subscription" },
    });

    expect(status).toEqual(200);
    expect(Array.isArray(data)).toBe(true);

    // Note: May be empty depending on workspace billing history
    // Validate schema for each invoice
    if (data.length > 0) {
      data.forEach((invoice) => {
        expect(() => InvoiceItem.parse(invoice)).not.toThrow();
        expect(invoice.source).toBe("subscription");
      });
    }
  });

  test("returns partnerPayout invoices", async () => {
    const { status, data } = await http.get<
      Array<{ id: string; source: string }>
    >({
      path: `/workspaces/${slug}/billing-lf/invoices`,
      query: { type: "partnerPayout" },
    });

    expect(status).toEqual(200);
    expect(Array.isArray(data)).toBe(true);

    // Note: May be empty depending on partner payouts
    if (data.length > 0) {
      data.forEach((invoice) => {
        expect(() => InvoiceItem.parse(invoice)).not.toThrow();
        expect(invoice.source).toBe("partnerPayout");
      });
    }
  });

  test("returns domainRenewal invoices", async () => {
    const { status, data } = await http.get<
      Array<{ id: string; source: string }>
    >({
      path: `/workspaces/${slug}/billing-lf/invoices`,
      query: { type: "domainRenewal" },
    });

    expect(status).toEqual(200);
    expect(Array.isArray(data)).toBe(true);

    // Note: May be empty depending on domain renewals
    if (data.length > 0) {
      data.forEach((invoice) => {
        expect(() => InvoiceItem.parse(invoice)).not.toThrow();
        expect(invoice.source).toBe("domainRenewal");
      });
    }
  });

  test("validates required fields in invoice items", async () => {
    const { status, data } = await http.get<
      Array<{
        id: string;
        source: string;
        total: number;
        createdAt: string;
        description: string;
      }>
    >({
      path: `/workspaces/${slug}/billing-lf/invoices`,
      query: { type: "subscription" },
    });

    expect(status).toEqual(200);

    if (data.length > 0) {
      const first = data[0];
      expect(first.id).toBeDefined();
      expect(first.source).toBeDefined();
      expect(typeof first.total).toBe("number");
      expect(first.createdAt).toBeDefined();
      // Validate ISO 8601 format
      expect(() => new Date(first.createdAt).toISOString()).not.toThrow();
      expect(first.description).toBeDefined();
      expect(first.description.length).toBeGreaterThan(0);
    }
  });

  test("rejects invalid type parameter", async () => {
    const { status, data } = await http.get<{ error: { message: string } }>({
      path: `/workspaces/${slug}/billing-lf/invoices`,
      query: { type: "invalid-type" },
    });

    expect(status).toEqual(422);
    expect(data.error).toBeDefined();
    expect(data.error.message).toContain("type");
  });

  test("requires type parameter", async () => {
    const { status, data } = await http.get<{ error: { message: string } }>({
      path: `/workspaces/${slug}/billing-lf/invoices`,
      query: {},
    });

    expect(status).toEqual(422);
    expect(data.error).toBeDefined();
    expect(data.error.message).toContain("Invalid");
  });

  test("amounts are in minor units", async () => {
    const { status, data } = await http.get<Array<{ total: number }>>({
      path: `/workspaces/${slug}/billing-lf/invoices`,
      query: { type: "subscription" },
    });

    expect(status).toEqual(200);

    // If there are invoices, verify total is a number (minor units)
    if (data.length > 0) {
      data.forEach((invoice) => {
        expect(typeof invoice.total).toBe("number");
        expect(Number.isInteger(invoice.total)).toBe(true);
      });
    }
  });

  test("supports pagination parameters", async () => {
    const { status, data } = await http.get<Array<{ id: string }>>({
      path: `/workspaces/${slug}/billing-lf/invoices`,
      query: { type: "subscription", limit: "5" },
    });

    expect(status).toEqual(200);
    expect(Array.isArray(data)).toBe(true);
    // If there are results, they should respect the limit
    if (data.length > 0) {
      expect(data.length).toBeLessThanOrEqual(5);
    }
  });

  test("subscription invoices include optional pdfUrl/status/paymentMethod fields", async () => {
    const { status, data } = await http.get<
      Array<{ pdfUrl?: string; status?: string; paymentMethod?: string; source: string }>
    >({
      path: `/workspaces/${slug}/billing-lf/invoices`,
      query: { type: "subscription" },
    });

    expect(status).toEqual(200);
    if (data.length > 0) {
      data.forEach((invoice) => {
        expect(invoice.source).toBe("subscription");
        if (invoice.pdfUrl) {
          expect(invoice.pdfUrl).toMatch(/^https?:\/\//);
        }
        if (invoice.status) {
          expect(["paid", "failed", "pending"]).toContain(invoice.status);
        }
        if (invoice.paymentMethod !== undefined) {
          expect(typeof invoice.paymentMethod).toBe("string");
          expect(invoice.paymentMethod.length).toBeGreaterThan(0);
        }
      });
    }
  });

  test("partner payout invoices include optional pdfUrl/status/paymentMethod fields", async () => {
    const { status, data } = await http.get<
      Array<{ pdfUrl?: string; status?: string; paymentMethod?: string; source: string }>
    >({
      path: `/workspaces/${slug}/billing-lf/invoices`,
      query: { type: "partnerPayout" },
    });

    expect(status).toEqual(200);
    if (data.length > 0) {
      data.forEach((invoice) => {
        expect(invoice.source).toBe("partnerPayout");
        if (invoice.pdfUrl) {
          expect(invoice.pdfUrl).toMatch(/^https?:\/\//);
        }
        if (invoice.status) {
          expect(["paid", "failed", "pending"]).toContain(invoice.status);
        }
        if (invoice.paymentMethod !== undefined) {
          expect(typeof invoice.paymentMethod).toBe("string");
          expect(invoice.paymentMethod.length).toBeGreaterThan(0);
        }
      });
    }
  });

  test("domain renewal invoices include optional pdfUrl/status/paymentMethod fields", async () => {
    const { status, data } = await http.get<
      Array<{ pdfUrl?: string; status?: string; paymentMethod?: string; source: string }>
    >({
      path: `/workspaces/${slug}/billing-lf/invoices`,
      query: { type: "domainRenewal" },
    });

    expect(status).toEqual(200);
    if (data.length > 0) {
      data.forEach((invoice) => {
        expect(invoice.source).toBe("domainRenewal");
        if (invoice.pdfUrl) {
          expect(invoice.pdfUrl).toMatch(/^https?:\/\//);
        }
        if (invoice.status) {
          expect(["paid", "failed", "pending"]).toContain(invoice.status);
        }
        if (invoice.paymentMethod !== undefined) {
          expect(typeof invoice.paymentMethod).toBe("string");
          expect(invoice.paymentMethod.length).toBeGreaterThan(0);
        }
      });
    }
  });
});
