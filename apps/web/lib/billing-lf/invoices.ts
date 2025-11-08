import { prisma } from "@dub/prisma";
import { APP_DOMAIN } from "@dub/utils";
import z from "@/lib/zod";
import type { InvoiceItemT } from "./types";
import { getProvider } from "./provider";

/**
 * Invoice Merge Strategy
 *
 * Invoices come from two sources:
 * 1. Provider (Stripe): Subscription invoices
 * 2. Database: Partner payouts, domain renewals
 *
 * This service orchestrates both sources and returns normalized InvoiceItemT[].
 */

export type InvoiceSource = "subscription" | "partnerPayout" | "domainRenewal";

/**
 * List invoices for a workspace by type
 *
 * @param workspaceId - Workspace ID
 * @param type - Invoice source type
 * @returns Normalized invoice items
 */
export async function listInvoices(
  workspaceId: string,
  type: InvoiceSource,
  options?: { limit?: number; startingAfter?: string; cursor?: string },
): Promise<InvoiceItemT[]> {
  switch (type) {
    case "subscription":
      return await listSubscriptionInvoices(workspaceId, {
        limit: options?.limit,
        startingAfter: options?.startingAfter,
      });
    case "partnerPayout":
      return await listPartnerPayoutInvoices(workspaceId, {
        limit: options?.limit,
        cursor: options?.cursor,
      });
    case "domainRenewal":
      return await listDomainRenewalInvoices(workspaceId, {
        limit: options?.limit,
        cursor: options?.cursor,
      });
    default:
      return [];
  }
}

/**
 * Get subscription invoices from payment provider
 */
async function listSubscriptionInvoices(
  workspaceId: string,
  options?: { limit?: number; startingAfter?: string },
): Promise<InvoiceItemT[]> {
  const provider = getProvider();
  const invoices = await provider.listSubscriptionInvoices({
    workspaceId,
    limit: options?.limit,
    startingAfter: options?.startingAfter,
  });

  return invoices.map((invoice) => ({
    id: invoice.id,
    source: "subscription" as const,
    total: invoice.total,
    createdAt: invoice.createdAt.toISOString(),
    status: invoice.status,
    description: invoice.description,
    paymentMethod: undefined, // could be enhanced to extract from provider
    pdfUrl: invoice.pdfUrl,
  }));
}

/**
 * Get partner payout invoices from database
 */
async function listPartnerPayoutInvoices(
  workspaceId: string,
  options?: { limit?: number; cursor?: string },
): Promise<InvoiceItemT[]> {
  const invoices = await prisma.invoice.findMany({
    where: {
      workspaceId,
      type: "partnerPayout",
    },
    orderBy: {
      createdAt: "desc",
    },
    take: options?.limit ?? 50,
    ...(options?.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
  });

  const statusSchema = z.enum(["paid", "failed", "pending"]);

  return invoices.map((invoice) => ({
    id: invoice.id,
    source: "partnerPayout" as const,
    total: invoice.total,
    createdAt: invoice.createdAt.toISOString(),
    status: statusSchema.parse(
      invoice.status === "completed"
        ? "paid"
        : invoice.status === "failed"
          ? "failed"
          : "pending",
    ),
    description: "Partner Payout",
    paymentMethod: undefined,
    pdfUrl: invoice.receiptUrl ?? undefined,
  }));
}

/**
 * Get domain renewal invoices from database
 */
async function listDomainRenewalInvoices(
  workspaceId: string,
  options?: { limit?: number; cursor?: string },
): Promise<InvoiceItemT[]> {
  const invoices = await prisma.invoice.findMany({
    where: {
      workspaceId,
      type: "domainRenewal",
    },
    orderBy: {
      createdAt: "desc",
    },
    take: options?.limit ?? 50,
    ...(options?.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
  });

  const statusSchema = z.enum(["paid", "failed", "pending"]);

  return invoices.map((invoice) => ({
    id: invoice.id,
    source: "domainRenewal" as const,
    total: invoice.total,
    createdAt: invoice.createdAt.toISOString(),
    status: statusSchema.parse(
      invoice.status === "completed"
        ? "paid"
        : invoice.status === "failed"
          ? "failed"
          : "pending",
    ),
    description: "Domain Renewal",
    paymentMethod: undefined,
    pdfUrl: invoice.receiptUrl ?? undefined,
  }));
}
