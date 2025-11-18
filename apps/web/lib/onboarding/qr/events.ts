import type { QRCodeDesign } from "@/ui/modals/link-qr-modal.types";

export const QROnboardingSeedEvent = "qr-onboarding:seed";

export type QROnboardingSeedDetail = {
  url?: string;
  qrDesign?: QRCodeDesign;
};

export function dispatchQROnboardingSeed(detail: QROnboardingSeedDetail): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new CustomEvent<QROnboardingSeedDetail>(QROnboardingSeedEvent, {
        detail,
      }),
    );
  } catch {
    // no-op
  }
}