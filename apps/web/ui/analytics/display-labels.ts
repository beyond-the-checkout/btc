import type { AnalyticsSaleUnit, EventType } from "@/lib/analytics/types";

/**
 * Centralized mapping of internal event types to user-facing display labels.
 * This is the single source of truth for event terminology across all analytics UI.
 */
export const EVENT_LABELS: Record<EventType, string> = {
  clicks: "Scans",
  leads: "Leads",
  sales: "Sales",
};

/**
 * Get the user-facing display label for an event type.
 *
 * @param event - The event type or "saleAmount" for revenue display
 * @param opts - Optional configuration for case transformation
 * @returns The formatted display label
 *
 * @example
 * getEventDisplayLabel("clicks") // "Scans"
 * getEventDisplayLabel("clicks", { case: "lower" }) // "scans"
 * getEventDisplayLabel("leads") // "Leads"
 */
export function getEventDisplayLabel(
  event: EventType | "saleAmount",
  opts?: { case?: "lower" | "title"; saleUnit?: AnalyticsSaleUnit },
): string {
  // Handle special case for revenue display when showing saleAmount
  // Currently keeps "Sales" but could be extended to show "Revenue" in the future
  let label =
    event === "saleAmount" ? "Sales" : EVENT_LABELS[event as EventType];

  // Apply case transformation if requested
  if (opts?.case === "lower") {
    label = label.toLowerCase();
  }

  return label;
}