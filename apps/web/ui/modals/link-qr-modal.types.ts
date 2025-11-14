import { DotType } from "@/lib/qr";
import { CornerDotType, CornerSquareType } from "@/lib/qr/constants";

export type QRCodeDesign = {
  fgColor: string; // Legacy field, used as fallback
  qrHideLogo: boolean;
  qrDotType: DotType;
  qrCornerSquareType: CornerSquareType;
  qrCornerDotType: CornerDotType;
  qrShape: "square" | "circle";
  hasFrame: boolean; // Computed from qrFrameStyle - not stored in DB
  qrFrameStyle?: "square" | "rounded" | "solid-circle" | "dotted-circle";
  qrFrameColor?: string;
  // Separate color fields for individual customization
  qrDotsColor?: string;
  qrCornerSquareColor?: string;
  qrCornerDotColor?: string;
};

export const DEFAULT_QR_CODE_DESIGN: QRCodeDesign = {
  fgColor: "#000000",
  qrHideLogo: false,
  qrDotType: "square",
  qrCornerSquareType: "square",
  qrCornerDotType: "square",
  qrShape: "square",
  hasFrame: false,
  qrFrameStyle: undefined,
  qrFrameColor: undefined,
  qrDotsColor: undefined,
  qrCornerSquareColor: undefined,
  qrCornerDotColor: undefined,
};

// Copied exactly from apps/web/ui/modals/link-qr-modal.tsx
export function migrateQRCodeDesign(d: any): QRCodeDesign {
  if (!d || typeof d !== "object") {
    return {
      fgColor: "#000000",
      qrHideLogo: false,
      qrDotType: "square",
      qrCornerSquareType: "square",
      qrCornerDotType: "square",
      qrShape: "square",
      hasFrame: false,
      qrFrameStyle: undefined,
      qrFrameColor: undefined,
      qrDotsColor: undefined,
      qrCornerSquareColor: undefined,
      qrCornerDotColor: undefined,
    } as QRCodeDesign;
  }

  const migrated: QRCodeDesign = {
    fgColor: d.fgColor ?? "#000000",
    qrHideLogo: d.qrHideLogo ?? d.hideLogo ?? false,
    qrDotType: d.qrDotType ?? d.dotType ?? "square",
    qrCornerSquareType:
      d.qrCornerSquareType ?? d.cornerSquareType ?? "square",
    qrCornerDotType: d.qrCornerDotType ?? d.cornerDotType ?? "square",
    qrShape: d.qrShape ?? "square",
    hasFrame: Boolean(d.qrFrameStyle ?? d.frameStyle),
    qrFrameStyle:
      d.qrFrameStyle ??
      (d.frameStyle === "none" ? undefined : d.frameStyle) ??
      undefined,
    qrFrameColor: d.qrFrameColor ?? d.frameColor ?? undefined,
    qrDotsColor: d.qrDotsColor ?? d.dotsColor ?? undefined,
    qrCornerSquareColor:
      d.qrCornerSquareColor ?? d.cornerSquareColor ?? undefined,
    qrCornerDotColor: d.qrCornerDotColor ?? d.cornerDotColor ?? undefined,
  };

  return migrated;
}