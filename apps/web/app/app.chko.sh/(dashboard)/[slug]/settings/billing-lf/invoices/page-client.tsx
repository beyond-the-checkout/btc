"use client";

import { InvoiceItemT } from "@/lib/billing-lf/types";
import { useBillingInvoices, useWorkspace } from "@/lib/swr-lf";
import { AnimatedEmptyState } from "@/ui/shared/animated-empty-state";
import {
  Button,
  buttonVariants,
  Receipt2,
  StatusBadge,
  Alert,
  AlertTitle,
  AlertDescription,
} from "@dub/ui";
import { cn, currencyFormatter } from "@dub/utils";

const STATUS_BADGE_VARIANTS = {
  paid: { variant: "success" as const, label: "Paid" },
  failed: { variant: "error" as const, label: "Failed" },
  pending: { variant: "pending" as const, label: "Pending" },
};

export default function WorkspaceInvoicesClientLF() {
  const { slug } = useWorkspace();

  const { data: invoices, loading, error } = useBillingInvoices({
    type: "subscription",
  });

  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      <div className="flex flex-col items-start justify-between gap-y-4 p-6 md:p-8 lg:flex-row">
        <div>
          <h2 className="text-xl font-medium">Invoices</h2>
          <p className="text-balance text-sm leading-normal text-neutral-500">
            A history of all your subscription invoices
          </p>
        </div>
      </div>
      {error && (
        <div className="px-6 pb-2 md:px-8">
          <Alert variant="destructive">
            <AlertTitle>Failed to load invoices</AlertTitle>
            <AlertDescription>
              Please try again. If the issue persists, contact support.
            </AlertDescription>
          </Alert>
        </div>
      )}
      <div className="grid divide-y divide-neutral-200 border-t border-neutral-200">
        {invoices ? (
          invoices.length > 0 ? (
            invoices.map((invoice) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
              />
            ))
          ) : (
            <AnimatedEmptyState
              title="No invoices found"
              description="You don't have any subscription invoices yet"
              cardContent={() => (
                <>
                  <Receipt2 className="size-4 text-neutral-700" />
                  <div className="h-2.5 w-24 min-w-0 rounded-sm bg-neutral-200" />
                </>
              )}
              className="border-none"
            />
          )
        ) : (
          <>
            <InvoiceCardSkeleton />
            <InvoiceCardSkeleton />
            <InvoiceCardSkeleton />
          </>
        )}
      </div>
    </div>
  );
}

const InvoiceCard = ({
  invoice,
}: {
  invoice: InvoiceItemT;
}) => {
  const statusBadge = invoice.status
    ? STATUS_BADGE_VARIANTS[invoice.status]
    : null;

  return (
    <div className="px-3 py-4 xl:px-12">
      {/* Mobile layout */}
      <div className="block xl:hidden">
        <div className="mb-4 flex items-start justify-between">
          <div className="text-sm">
            <div className="font-medium">{invoice.description}</div>
            <div className="text-neutral-500">
              {new Date(invoice.createdAt).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
                day: "numeric",
              })}
            </div>
          </div>
          <div className="flex items-center">
            {invoice.pdfUrl ? (
              <a
                href={invoice.pdfUrl}
                target="_blank"
                className={cn(
                  buttonVariants({ variant: "secondary" }),
                  "flex h-9 items-center justify-center rounded-md border px-3 text-sm",
                )}
              >
                <span>View invoice</span>
              </a>
            ) : (
              <Button
                className="h-9 px-3"
                variant="secondary"
                text="View invoice"
                disabled
                disabledTooltip="Invoice not available. Contact support if you need assistance."
              />
            )}
          </div>
        </div>

        <div className="text-left text-sm">
          <div className="font-medium">Total</div>
          <div className="flex items-center gap-1.5 text-neutral-500">
            <span className="text-sm font-medium">
              {currencyFormatter(invoice.total / 100)}
            </span>
            {statusBadge && (
              <StatusBadge
                icon={null}
                variant={statusBadge.variant}
                className="rounded-md py-0.5"
              >
                {statusBadge.label}
              </StatusBadge>
            )}
          </div>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden xl:grid xl:grid-cols-3 xl:gap-4">
        <div className="text-sm xl:col-span-1">
          <div className="font-medium">{invoice.description}</div>
          <div className="text-neutral-500">
            {new Date(invoice.createdAt).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
              day: "numeric",
            })}
          </div>
        </div>

        <div className="text-left text-sm sm:col-span-1">
          <div className="font-medium">Total</div>
          <div className="flex items-center gap-1.5 text-neutral-500">
            <span className="text-sm font-medium">
              {currencyFormatter(invoice.total / 100)}
            </span>
            {statusBadge && (
              <StatusBadge
                icon={null}
                variant={statusBadge.variant}
                className="rounded-md py-0.5"
              >
                {statusBadge.label}
              </StatusBadge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end sm:col-span-1 sm:justify-end">
          {invoice.pdfUrl ? (
            <a
              href={invoice.pdfUrl}
              target="_blank"
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "flex h-9 items-center justify-center rounded-md border px-3 text-sm",
              )}
            >
              <span>View invoice</span>
            </a>
          ) : (
            <Button
              className="h-9 px-3"
              variant="secondary"
              text="View invoice"
              disabled
              disabledTooltip="Invoice not available. Contact support if you need assistance."
            />
          )}
        </div>
      </div>
    </div>
  );
};

const InvoiceCardSkeleton = () => {
  return (
    <div className="px-4 py-6 sm:px-12">
      {/* Mobile skeleton */}
      <div className="block sm:hidden">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex flex-col gap-1 text-sm">
            <div className="h-4 w-32 animate-pulse rounded-md bg-neutral-200" />
            <div className="h-4 w-24 animate-pulse rounded-md bg-neutral-200" />
          </div>
          <div className="h-9 w-24 animate-pulse rounded-md bg-neutral-200" />
        </div>

        <div className="flex flex-col gap-1">
          <div className="h-4 w-16 animate-pulse rounded-md bg-neutral-200" />
          <div className="h-4 w-20 animate-pulse rounded-md bg-neutral-200" />
        </div>
      </div>

      {/* Desktop skeleton */}
      <div className="hidden sm:grid sm:grid-cols-3 sm:gap-4">
        <div className="flex flex-col gap-1 text-sm sm:col-span-1">
          <div className="h-4 w-32 animate-pulse rounded-md bg-neutral-200" />
          <div className="h-4 w-24 animate-pulse rounded-md bg-neutral-200" />
        </div>

        <div className="flex flex-col gap-1 sm:col-span-1">
          <div className="h-4 w-16 animate-pulse rounded-md bg-neutral-200" />
          <div className="h-4 w-20 animate-pulse rounded-md bg-neutral-200" />
        </div>

        <div className="flex items-center justify-end sm:col-span-1 sm:justify-end">
          <div className="h-9 w-24 animate-pulse rounded-md bg-neutral-200" />
        </div>
      </div>
    </div>
  );
};
