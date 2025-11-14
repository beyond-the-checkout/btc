import { createContext, useContext } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { QRCodeDesign } from "@/ui/modals/link-qr-modal.types";
import type { QRLinkProps } from "@/lib/types";
import { frameStyleToFrameType } from "@/lib/qr/types";
import { getQRData } from "@/lib/qr";

/**
 * Debounced function type helper that models the control methods
 * commonly exposed by debounce utilities (flush/cancel/pending).
 */
export type DebouncedFn<T extends (...args: any[]) => any> = ((
  ...args: Parameters<T>
) => void) & {
  flush?: () => void;
  cancel?: () => void;
  pending?: () => boolean;
};

/**
 * Consolidated context value for the Link QR Modal.
 * This removes prop drilling and centralizes state, derived data, and actions.
 */
export interface LinkQRContextValue {
  // state
  id: string;
  isMobile: boolean;
  plan?: string;
  slug?: string;
  draft: QRCodeDesign;
  setDraft: Dispatch<SetStateAction<QRCodeDesign>>;

  // derived
  url?: string;
  logo?: string;
  hideLogo: boolean;
  frameOptions?: {
    type: ReturnType<typeof frameStyleToFrameType>;
    color: string;
  };
  qrData: ReturnType<typeof getQRData> | null;
  qrDataForActions: ReturnType<typeof getQRData> | null;

  // external
  linkProps: QRLinkProps;

  // actions
  onColorChange: DebouncedFn<(color: string) => void>;
  onFrameColorChange: DebouncedFn<(color: string) => void>;
  flushAll: () => void;
  save: () => void;
  close: () => void;
}

const LinkQRModalContext = createContext<LinkQRContextValue | null>(null);

export function useLinkQRContext(): LinkQRContextValue {
  const ctx = useContext(LinkQRModalContext);
  if (!ctx) {
    throw new Error("useLinkQRContext must be used within LinkQRModalProvider");
  }
  return ctx;
}

export const LinkQRModalProvider = LinkQRModalContext.Provider;