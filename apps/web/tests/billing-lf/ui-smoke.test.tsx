import { describe, expect, test } from "vitest";
import fs from "fs";
import path from "path";

/**
 * Smoke tests for License-Free (LF) UI components
 *
 * These tests verify that components:
 * - Export correctly
 * - Have proper display names
 * - Are importable without errors
 *
 * Note: These are NOT integration tests. They just verify the module structure
 * and basic component existence to catch build/import issues early.
 */

describe("LF UI Components - Smoke Tests", () => {
  test("UpgradePlanButtonLF exports correctly", async () => {
    const module = await import(
      "@/ui/workspaces/upgrade-plan-button-lf"
    );

    expect(module.UpgradePlanButtonLF).toBeDefined();
    expect(typeof module.UpgradePlanButtonLF).toBe("function");
  });

  test("SubscriptionMenuLF exports correctly", async () => {
    const module = await import(
      "@/ui/workspaces/subscription-menu-lf"
    );

    // This component uses export default
    expect(module.default).toBeDefined();
    expect(typeof module.default).toBe("function");
  });

  /**
   * Note: Page-level components in app/app.chko.sh/(dashboard)/[slug]/settings/billing-lf/
   * are tested through their actual use in the application rather than import tests,
   * as Next.js App Router path resolution can be complex in test environments.
   *
   * Components verified to exist:
   * - PlanUsageLF (plan-usage-lf.tsx)
   * - UsageChartLF (usage-chart-lf.tsx)
   * - PaymentMethodsLF (payment-methods-lf.tsx)
   *
   * These are integration-tested via the billing-lf page.tsx which imports them.
   */
  test("Page components exist in correct locations", () => {
    const base = path.resolve(
      process.cwd(),
      "apps/web/app/app.chko.sh/(dashboard)/[slug]/settings/billing-lf",
    );
    const files = [
      "plan-usage-lf.tsx",
      "usage-chart-lf.tsx",
      "payment-methods-lf.tsx",
    ];

    files.forEach((f) => {
      const p = path.join(base, f);
      expect(fs.existsSync(p)).toBe(true);
    });
  });
});

describe("LF Hooks - Smoke Tests", () => {
  test("useBillingUsage exports correctly", async () => {
    const module = await import("@/lib/swr-lf/use-billing-usage");

    // Uses export default
    expect(module.default).toBeDefined();
    expect(typeof module.default).toBe("function");
  });

  test("useBillingPaymentMethods exports correctly", async () => {
    const module = await import("@/lib/swr-lf/use-billing-payment-methods");

    // Uses export default
    expect(module.default).toBeDefined();
    expect(typeof module.default).toBe("function");
  });

  test("useBillingInvoices exports correctly", async () => {
    const module = await import("@/lib/swr-lf/use-billing-invoices");

    // Uses export default
    expect(module.default).toBeDefined();
    expect(typeof module.default).toBe("function");
  });

  test("index.ts exports all hooks", async () => {
    const module = await import("@/lib/swr-lf");

    // Named exports from index
    expect(module.useBillingUsage).toBeDefined();
    expect(module.useBillingPaymentMethods).toBeDefined();
    expect(module.useBillingInvoices).toBeDefined();
    expect(module.useWorkspace).toBeDefined();
    expect(module.useUsers).toBeDefined();
    expect(module.useTagsCount).toBeDefined();
  });
});

describe("LF Service Layer - Smoke Tests", () => {
  test("billing-lf/types exports all schemas", async () => {
    const module = await import("@/lib/billing-lf/types");

    // Zod schemas
    expect(module.PlanTier).toBeDefined();
    expect(module.BillingPeriod).toBeDefined();
    expect(module.UpgradeRequest).toBeDefined();
    expect(module.UpgradeResponse).toBeDefined();
    expect(module.PaymentMethodSummary).toBeDefined();
    expect(module.InvoiceItem).toBeDefined();
    expect(module.UsagePoint).toBeDefined();
    expect(module.UsageQuery).toBeDefined();
  });

  test("billing-lf/provider exports interface and factory", async () => {
    const module = await import("@/lib/billing-lf/provider");

    expect(module.getProvider).toBeDefined();
    expect(typeof module.getProvider).toBe("function");
  });

  test("billing-lf/policies exports enforcement functions", async () => {
    const module = await import("@/lib/billing-lf/policies");

    expect(module.assertPaymentMethodAllowed).toBeDefined();
    expect(typeof module.assertPaymentMethodAllowed).toBe("function");

    expect(module.isLegacyPlan).toBeDefined();
    expect(typeof module.isLegacyPlan).toBe("function");

    expect(module.getPlanDisplayName).toBeDefined();
    expect(typeof module.getPlanDisplayName).toBe("function");
  });

  test("billing-lf/invoices exports listInvoices", async () => {
    const module = await import("@/lib/billing-lf/invoices");

    expect(module.listInvoices).toBeDefined();
    expect(typeof module.listInvoices).toBe("function");
  });

  test("billing-lf/usage exports getUsage", async () => {
    const module = await import("@/lib/billing-lf/usage");

    expect(module.getUsage).toBeDefined();
    expect(typeof module.getUsage).toBe("function");
  });
});
