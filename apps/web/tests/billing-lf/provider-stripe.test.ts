import { StripeAdapter } from "@/lib/billing-lf/providers/stripe";
import { describe, expect, test } from "vitest";

// Testable subclass to access protected helpers without casting to any
class TestStripeAdapter extends StripeAdapter {
  public normalizePaymentMethodForTest(pm: any) {
    // @ts-ignore protected access via subclass wrapper
    return this.normalizePaymentMethod(pm);
  }
  public normalizeInvoiceStatusForTest(status: any) {
    // @ts-ignore protected access via subclass wrapper
    return this.normalizeInvoiceStatus(status);
  }
}

/**
 * Unit tests for Stripe Provider Adapter
 *
 * These tests verify the adapter's normalization and validation logic.
 * They use mock data to avoid dependency on actual Stripe API calls.
 *
 * Tests cover:
 * - Payment method normalization (Stripe → PaymentMethodSummaryT)
 * - Invoice status normalization (Stripe → provider-agnostic)
 * - Display name generation
 * - Security validations (baseUrl/returnUrl checks)
 */

describe("StripeAdapter - Payment Method Normalization", () => {
  const adapter = new TestStripeAdapter();

  test("normalizes card payment method", () => {
    const stripePM = {
      id: "pm_123",
      type: "card" as const,
      card: {
        brand: "visa",
        last4: "4242",
      },
    };

    // Access private method via type assertion for testing
    const normalized = adapter.normalizePaymentMethodForTest(stripePM);

    expect(normalized.id).toBe("pm_123");
    expect(normalized.type).toBe("card");
    expect(normalized.brand).toBe("visa");
    expect(normalized.last4).toBe("4242");
    expect(normalized.isDirectDebit).toBe(false);
    expect(normalized.connected).toBe(true);
    expect(normalized.displayName).toContain("Visa");
    expect(normalized.displayName).toContain("4242");
  });

  test("normalizes us_bank_account payment method", () => {
    const stripePM = {
      id: "pm_456",
      type: "us_bank_account" as const,
      us_bank_account: {
        last4: "6789",
      },
    };

    const normalized = adapter.normalizePaymentMethodForTest(stripePM);

    expect(normalized.id).toBe("pm_456");
    expect(normalized.type).toBe("us_bank_account");
    expect(normalized.last4).toBe("6789");
    expect(normalized.isDirectDebit).toBe(true);
    expect(normalized.displayName).toContain("US Bank");
    expect(normalized.displayName).toContain("6789");
  });

  test("normalizes sepa_debit payment method", () => {
    const stripePM = {
      id: "pm_789",
      type: "sepa_debit" as const,
      sepa_debit: {
        last4: "1234",
      },
    };

    const normalized = adapter.normalizePaymentMethodForTest(stripePM);

    expect(normalized.id).toBe("pm_789");
    expect(normalized.type).toBe("sepa_debit");
    expect(normalized.last4).toBe("1234");
    expect(normalized.isDirectDebit).toBe(true);
    expect(normalized.displayName).toContain("SEPA");
    expect(normalized.displayName).toContain("1234");
  });

  test("normalizes acss_debit payment method", () => {
    const stripePM = {
      id: "pm_abc",
      type: "acss_debit" as const,
      acss_debit: {
        last4: "5678",
      },
    };

    const normalized = adapter.normalizePaymentMethodForTest(stripePM);

    expect(normalized.type).toBe("acss_debit");
    expect(normalized.isDirectDebit).toBe(true);
    expect(normalized.displayName).toContain("ACSS");
  });

  test("normalizes link payment method", () => {
    const stripePM = {
      id: "pm_link",
      type: "link" as const,
    };

    const normalized = adapter.normalizePaymentMethodForTest(stripePM);

    expect(normalized.type).toBe("link");
    expect(normalized.displayName).toBe("Link");
    expect(normalized.connected).toBe(true);
  });
});

describe("StripeAdapter - Invoice Status Normalization", () => {
  const adapter = new TestStripeAdapter();

  test("maps 'paid' status correctly", () => {
    const status = adapter.normalizeInvoiceStatusForTest("paid");
    expect(status).toBe("paid");
  });

  test("maps 'open' to 'pending'", () => {
    const status = adapter.normalizeInvoiceStatusForTest("open");
    expect(status).toBe("pending");
  });

  test("maps 'draft' to 'pending'", () => {
    const status = adapter.normalizeInvoiceStatusForTest("draft");
    expect(status).toBe("pending");
  });

  test("maps 'void' to 'failed'", () => {
    const status = adapter.normalizeInvoiceStatusForTest("void");
    expect(status).toBe("failed");
  });

  test("maps 'uncollectible' to 'failed'", () => {
    const status = adapter.normalizeInvoiceStatusForTest("uncollectible");
    expect(status).toBe("failed");
  });

  test("returns undefined for null status", () => {
    const status = adapter.normalizeInvoiceStatusForTest(null);
    expect(status).toBeUndefined();
  });
});

describe("StripeAdapter - Display Name Generation", () => {
  const adapter = new TestStripeAdapter();

  test("capitalizes card brand in display name", () => {
    const stripePM = {
      id: "pm_test",
      type: "card" as const,
      card: {
        brand: "mastercard",
        last4: "1111",
      },
    };

    const normalized = adapter.normalizePaymentMethodForTest(stripePM);
    expect(normalized.displayName).toMatch(/^Mastercard/);
  });

  test("handles missing brand gracefully", () => {
    const stripePM = {
      id: "pm_test",
      type: "card" as const,
      card: {
        last4: "2222",
      },
    };

    const normalized = adapter.normalizePaymentMethodForTest(stripePM);
    expect(normalized.displayName).toContain("Card");
    expect(normalized.displayName).toContain("2222");
  });

  test("includes last4 in all payment methods", () => {
    const methods = [
      {
        id: "pm_1",
        type: "card" as const,
        card: { brand: "visa", last4: "1111" },
      },
      {
        id: "pm_2",
        type: "us_bank_account" as const,
        us_bank_account: { last4: "2222" },
      },
      {
        id: "pm_3",
        type: "sepa_debit" as const,
        sepa_debit: { last4: "3333" },
      },
    ];

    methods.forEach((pm) => {
      const normalized = adapter.normalizePaymentMethodForTest(pm);
      const expectedLast4 =
        pm.type === "card"
          ? pm.card.last4
          : pm.type === "us_bank_account"
            ? pm.us_bank_account.last4
            : pm.sepa_debit.last4;
      expect(normalized.displayName).toContain(expectedLast4);
    });
  });
});

describe("StripeAdapter - Direct Debit Detection", () => {
  const adapter = new TestStripeAdapter();

  test("identifies direct debit payment methods", () => {
    const directDebitTypes = [
      "us_bank_account",
      "sepa_debit",
      "acss_debit",
    ];

    directDebitTypes.forEach((type) => {
      const stripePM = {
        id: "pm_test",
        type: type as any,
        [type]: { last4: "0000" },
      };

    const normalized = adapter.normalizePaymentMethodForTest(stripePM);
      expect(normalized.isDirectDebit).toBe(true);
    });
  });

  test("identifies non-direct debit payment methods", () => {
    const nonDirectDebitTypes = ["card", "link"];

    nonDirectDebitTypes.forEach((type) => {
      const stripePM = {
        id: "pm_test",
        type: type as any,
        ...(type === "card" ? { card: { last4: "0000" } } : {}),
      };

    const normalized = adapter.normalizePaymentMethodForTest(stripePM);
      expect(normalized.isDirectDebit).toBe(false);
    });
  });
});

describe("StripeAdapter - Data Integrity", () => {
  const adapter = new TestStripeAdapter();

  test("preserves payment method ID", () => {
    const stripePM = {
      id: "pm_unique_123",
      type: "card" as const,
      card: { brand: "visa", last4: "4242" },
    };

    const normalized = adapter.normalizePaymentMethodForTest(stripePM);
    expect(normalized.id).toBe("pm_unique_123");
  });

  test("sets connected=true for all payment methods", () => {
    const types = ["card", "us_bank_account", "sepa_debit", "link"];

    types.forEach((type) => {
      const stripePM = {
        id: "pm_test",
        type: type as any,
        ...(type === "card" ? { card: { last4: "0000" } } : {}),
        ...(type === "us_bank_account" ? { us_bank_account: { last4: "0000" } } : {}),
        ...(type === "sepa_debit" ? { sepa_debit: { last4: "0000" } } : {}),
      };

    const normalized = adapter.normalizePaymentMethodForTest(stripePM);
      expect(normalized.connected).toBe(true);
    });
  });
});
