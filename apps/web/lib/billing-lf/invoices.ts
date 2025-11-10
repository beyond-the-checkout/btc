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

export type InvoiceSource = "subscription";

/**
 * List invoices for a workspace by type
 *
 * @param workspaceId - Workspace ID
 * @param type - Invoice source type
 * @returns Normalized invoice items
 */
export async function listInvoices(
  workspaceId: string,
  _type: InvoiceSource,
  options?: { limit?: number; startingAfter?: string; cursor?: string },
): Promise<InvoiceItemT[]> {
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[billing-lf/invoices] listInvoices called: workspaceId=${workspaceId}, type=subscription`,
    );
  }

  try {
    return await listSubscriptionInvoices(workspaceId, {
      limit: options?.limit,
      startingAfter: options?.startingAfter,
    });
  } catch (error) {
    console.error(
      `[billing-lf/invoices] Error in listInvoices for subscription:`,
      error,
    );
    throw error;
  }
}

/**
 * Get subscription invoices from payment provider
 */
async function listSubscriptionInvoices(
  workspaceId: string,
  options?: { limit?: number; startingAfter?: string },
): Promise<InvoiceItemT[]> {
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[billing-lf/invoices] listSubscriptionInvoices: workspaceId=${workspaceId}`,
    );
  }
  
  try {
    const provider = getProvider();
    const invoices = await provider.listSubscriptionInvoices({
      workspaceId,
      limit: options?.limit,
      startingAfter: options?.startingAfter,
    });

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[billing-lf/invoices] Stripe returned ${invoices.length} invoices`,
      );
    }

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
  } catch (error) {
    console.error(`[billing-lf/invoices] Error in listSubscriptionInvoices:`, error);
    throw error;
  }
}
