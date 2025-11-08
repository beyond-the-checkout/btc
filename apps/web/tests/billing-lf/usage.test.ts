import { UsagePoint } from "@/lib/billing-lf/types";
import { describe, expect, test } from "vitest";
import { IntegrationHarness } from "../utils/integration";

/**
 * Tests for GET /api/workspaces/[idOrSlug]/billing-lf/usage
 *
 * Tests cover:
 * - Timeseries data contract (ISO timestamps + numeric values)
 * - Query parameter validation (resource, start, end, timezone)
 * - Schema validation using Zod
 * - Data format consistency
 *
 * Note: These tests require E2E environment variables to be configured.
 */

// Skip if E2E environment is not configured
const skipE2E = !process.env.E2E_BASE_URL;

describe.skipIf(skipE2E).sequential("GET /billing-lf/usage", async () => {
  const h = new IntegrationHarness();
  const { workspace, http } = await h.init();
  const slug = workspace.slug;

  // Helper to generate test date range
  const getDateRange = () => ({
    // Fixed dates for determinism
    start: "2024-01-01T00:00:00.000Z",
    end: "2024-01-07T23:59:59.999Z",
  });

  test("returns timeseries points for links", async () => {
    const { start, end } = getDateRange();

    const { status, data } = await http.get<Array<{ ts: string; value: number }>>(
      {
        path: `/workspaces/${slug}/billing-lf/usage`,
        query: {
          resource: "links",
          start,
          end,
          timezone: "UTC",
        },
      },
    );

    expect(status).toEqual(200);
    expect(Array.isArray(data)).toBe(true);

    // Note: May be empty depending on usage in the fixed interval
    // Validate schema for each data point when present
    data.forEach((point) => {
      expect(() => UsagePoint.parse(point)).not.toThrow();
    });
  });

  test("returns timeseries points for events", async () => {
    const { start, end } = getDateRange();

    const { status, data } = await http.get<Array<{ ts: string; value: number }>>(
      {
        path: `/workspaces/${slug}/billing-lf/usage`,
        query: {
          resource: "events",
          start,
          end,
          timezone: "UTC",
        },
      },
    );

    expect(status).toEqual(200);
    expect(Array.isArray(data)).toBe(true);

    data.forEach((point) => {
      expect(() => UsagePoint.parse(point)).not.toThrow();
    });
  });

  test("validates data point structure", async () => {
    const { start, end } = getDateRange();

    const { status, data } = await http.get<Array<{ ts: string; value: number }>>(
      {
        path: `/workspaces/${slug}/billing-lf/usage`,
        query: {
          resource: "links",
          start,
          end,
          timezone: "UTC",
        },
      },
    );

    expect(status).toEqual(200);

    // Note: Timeseries can be empty for the given date range
    if (data.length > 0) {
      const first = data[0];

      // Validate timestamp is ISO 8601 string
      expect(first.ts).toBeDefined();
      expect(typeof first.ts).toBe("string");
      expect(() => new Date(first.ts).toISOString()).not.toThrow();

      // Validate value is a number
      expect(first.value).toBeDefined();
      expect(typeof first.value).toBe("number");
      expect(first.value).toBeGreaterThanOrEqual(0);
    }
  });

  test("requires resource parameter", async () => {
    const { start, end } = getDateRange();

    const { status, data } = await http.get<{ error: { message: string } }>({
      path: `/workspaces/${slug}/billing-lf/usage`,
      query: {
        start,
        end,
        timezone: "UTC",
      },
    });

    expect(status).toEqual(422);
    expect(data.error).toBeDefined();
    expect(data.error.message).toContain("resource");
  });

  test("requires start parameter", async () => {
    const { end } = getDateRange();

    const { status, data } = await http.get<{ error: { message: string } }>({
      path: `/workspaces/${slug}/billing-lf/usage`,
      query: {
        resource: "links",
        end,
        timezone: "UTC",
      },
    });

    expect(status).toEqual(422);
    expect(data.error).toBeDefined();
    expect(data.error.message).toContain("start");
  });

  test("requires end parameter", async () => {
    const { start } = getDateRange();

    const { status, data } = await http.get<{ error: { message: string } }>({
      path: `/workspaces/${slug}/billing-lf/usage`,
      query: {
        resource: "links",
        start,
        timezone: "UTC",
      },
    });

    expect(status).toEqual(422);
    expect(data.error).toBeDefined();
    expect(data.error.message).toContain("end");
  });

  test("defaults to UTC timezone", async () => {
    const { start, end } = getDateRange();

    const { status, data } = await http.get<Array<{ ts: string; value: number }>>(
      {
        path: `/workspaces/${slug}/billing-lf/usage`,
        query: {
          resource: "links",
          start,
          end,
          // No timezone specified
        },
      },
    );

    expect(status).toEqual(200);
    expect(Array.isArray(data)).toBe(true);
  });

  test("validates resource enum", async () => {
    const { start, end } = getDateRange();

    const { status, data } = await http.get<{ error: { message: string } }>({
      path: `/workspaces/${slug}/billing-lf/usage`,
      query: {
        resource: "invalid-resource",
        start,
        end,
        timezone: "UTC",
      },
    });

    expect(status).toEqual(422);
    expect(data.error).toBeDefined();
    expect(data.error.message).toContain("Invalid");
  });

  test("supports different timezones", async () => {
    const { start, end } = getDateRange();

    const { status, data } = await http.get<Array<{ ts: string; value: number }>>(
      {
        path: `/workspaces/${slug}/billing-lf/usage`,
        query: {
          resource: "links",
          start,
          end,
          timezone: "America/New_York",
        },
      },
    );

    expect(status).toEqual(200);
    expect(Array.isArray(data)).toBe(true);
  });
});
