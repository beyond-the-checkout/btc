import { getQRData } from "@/lib/qr";
import { frameStyleToFrameType } from "@/lib/qr/types";
import type { QRLinkProps } from "@/lib/types";
import type { QRCodeDesign } from "@/ui/modals/link-qr-modal.types";
import type { Dispatch, SetStateAction } from "react";
import { createContext, useContext } from "react";

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
