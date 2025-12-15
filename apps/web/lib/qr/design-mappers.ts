/**
 * Mapping utilities between QRCodeDesign (UI state) and Link QR fields (database).
 * Used by the QR bootstrap route and WelcomeModal to convert designs to link payloads.
 */
import type { QRCodeDesign } from "@/ui/modals/link-qr-modal.types";

/**
 * QR-related fields stored on a Link in the database.
 */
export type LinkQRFields = {
  qrDotType?: string | null;
  qrDotsColor?: string | null;
  qrCornerSquareType?: string | null;
  qrCornerSquareColor?: string | null;
  qrCornerDotType?: string | null;
  qrCornerDotColor?: string | null;
  qrShape?: string | null;
  qrFrameStyle?: string | null;
  qrFrameColor?: string | null;
  qrHideLogo?: boolean | null;
};

/**
 * Convert a QRCodeDesign (UI state) to LinkQRFields (database fields).
 *
 * Notes:
 * - Uses qrDotsColor ?? fgColor as the "best effort" dots color
 * - If qrFrameStyle is undefined, sets it to null (no frame)
 * - Does not include hasFrame (it's computed, not stored)
 */
export function qrDesignToLinkQRFields(
  design?: QRCodeDesign,
): LinkQRFields | undefined {
  if (!design) return undefined;

  return {
    qrDotType: design.qrDotType || null,
    qrDotsColor: design.qrDotsColor ?? design.fgColor ?? null,
    qrCornerSquareType: design.qrCornerSquareType || null,
    qrCornerSquareColor: design.qrCornerSquareColor || null,
    qrCornerDotType: design.qrCornerDotType || null,
    qrCornerDotColor: design.qrCornerDotColor || null,
    qrShape: design.qrShape || null,
    qrFrameStyle: design.qrFrameStyle || null,
    qrFrameColor: design.qrFrameColor || null,
    qrHideLogo: design.qrHideLogo || null,
  };
}

/**
 * Sanitize QR design fields based on workspace plan.
 * Free plan users cannot customize certain QR features.
 * Call this before creating a link to ensure the design is compatible with the plan.
 *
 * NOTE: QR fields are not yet in the Prisma schema. Until they're added,
 * this function returns undefined to prevent Prisma validation errors.
 * TODO: Add QR fields to link.prisma schema and remove this workaround.
 */
export function sanitizeQrFieldsForPlan(
  fields: LinkQRFields | undefined,
  _plan: string | undefined,
): LinkQRFields | undefined {
  // QR fields are not yet in the Prisma schema - return undefined to prevent errors
  // Once the schema is updated, uncomment the logic below:
  /*
  if (!fields) return undefined;

  // Free plan users get default QR settings only
  if (!plan || plan === "free") {
    return {
      qrDotType: null,
      qrDotsColor: null,
      qrCornerSquareType: null,
      qrCornerSquareColor: null,
      qrCornerDotType: null,
      qrCornerDotColor: null,
      qrShape: null,
      qrFrameStyle: null,
      qrFrameColor: null,
      qrHideLogo: null,
    };
  }

  return fields;
  */
  void fields; // Suppress unused warning
  return undefined;
}
