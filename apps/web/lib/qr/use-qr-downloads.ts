/**
 * useQrDownloads Hook
 *
 * Unified hook for QR code download and copy operations across all surfaces.
 * Provides consistent behavior for PNG, SVG, JPEG downloads and clipboard copy.
 */

"use client";

import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { getQRAsCanvas, getQRAsSVGDataUri, type QRProps } from "./index";
import { buildQrFilename } from "./render";

export type QrDownloadMode = "dynamic" | "static";

export type UseQrDownloadsOptions = {
  /** QR data from getQRData or buildQrRenderData + toQRDataInput */
  qrData: QRProps | null;
  /** Download mode affects filename generation */
  mode: QrDownloadMode;
  /** Link key for dynamic mode filenames */
  linkKey?: string;
  /** Link domain for dynamic mode filenames */
  linkDomain?: string;
  /** Destination URL for static mode filenames */
  destinationUrl?: string;
  /** Callback after successful download */
  onDownloadSuccess?: (format: "png" | "svg" | "jpeg") => void;
  /** Callback after successful copy */
  onCopySuccess?: () => void;
};

export type UseQrDownloadsReturn = {
  /** Hidden anchor ref - must be rendered in component */
  anchorRef: React.RefObject<HTMLAnchorElement | null>;
  /** Download as PNG */
  downloadPng: () => Promise<void>;
  /** Download as SVG */
  downloadSvg: () => Promise<void>;
  /** Download as JPEG */
  downloadJpeg: () => Promise<void>;
  /** Copy image to clipboard */
  copyImage: () => Promise<void>;
  /** Copy short link URL to clipboard (for dynamic mode) */
  copyUrl: (url: string) => Promise<void>;
};

/**
 * Hook providing unified download and copy functionality for QR codes.
 *
 * Usage:
 * ```tsx
 * const { anchorRef, downloadPng, downloadSvg, copyImage } = useQrDownloads({
 *   qrData,
 *   mode: "dynamic",
 *   linkKey: props.key,
 *   linkDomain: props.domain,
 * });
 *
 * return (
 *   <>
 *     <button onClick={downloadPng}>Download PNG</button>
 *     <a ref={anchorRef} className="hidden" />
 *   </>
 * );
 * ```
 */
export function useQrDownloads(
  options: UseQrDownloadsOptions,
): UseQrDownloadsReturn {
  const {
    qrData,
    mode,
    linkKey,
    linkDomain,
    destinationUrl,
    onDownloadSuccess,
    onCopySuccess,
  } = options;

  const anchorRef = useRef<HTMLAnchorElement>(null);

  /**
   * Trigger download via hidden anchor element
   */
  const triggerDownload = useCallback(
    (dataUrl: string, filename: string) => {
      if (!anchorRef.current) {
        console.error("[useQrDownloads] Anchor ref not available");
        return;
      }
      anchorRef.current.href = dataUrl;
      anchorRef.current.download = filename;
      anchorRef.current.click();
    },
    [],
  );

  /**
   * Generate filename for given format
   */
  const getFilename = useCallback(
    (extension: string) => {
      return buildQrFilename({
        mode,
        extension,
        linkKey,
        linkDomain,
        destinationUrl,
      });
    },
    [mode, linkKey, linkDomain, destinationUrl],
  );

  const downloadPng = useCallback(async () => {
    if (!qrData) {
      toast.error("QR code data not available");
      return;
    }
    try {
      const dataUrl = await getQRAsCanvas(qrData, "image/png");
      triggerDownload(dataUrl as string, getFilename("png"));
      onDownloadSuccess?.("png");
    } catch (error) {
      console.error("[useQrDownloads] PNG download failed:", error);
      toast.error("Failed to download PNG");
    }
  }, [qrData, triggerDownload, getFilename, onDownloadSuccess]);

  const downloadSvg = useCallback(async () => {
    if (!qrData) {
      toast.error("QR code data not available");
      return;
    }
    try {
      const dataUrl = await getQRAsSVGDataUri(qrData);
      triggerDownload(dataUrl, getFilename("svg"));
      onDownloadSuccess?.("svg");
    } catch (error) {
      console.error("[useQrDownloads] SVG download failed:", error);
      toast.error("Failed to download SVG");
    }
  }, [qrData, triggerDownload, getFilename, onDownloadSuccess]);

  const downloadJpeg = useCallback(async () => {
    if (!qrData) {
      toast.error("QR code data not available");
      return;
    }
    try {
      const dataUrl = await getQRAsCanvas(qrData, "image/jpeg");
      triggerDownload(dataUrl as string, getFilename("jpg"));
      onDownloadSuccess?.("jpeg");
    } catch (error) {
      console.error("[useQrDownloads] JPEG download failed:", error);
      toast.error("Failed to download JPEG");
    }
  }, [qrData, triggerDownload, getFilename, onDownloadSuccess]);

  const copyImage = useCallback(async () => {
    if (!qrData) {
      toast.error("QR code data not available");
      return;
    }
    try {
      const canvas = await getQRAsCanvas(qrData, "image/png", true);
      if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error("Failed to create canvas");
      }

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error("Failed to create blob"));
        }, "image/png");
      });

      const item = new ClipboardItem({ "image/png": blob });
      await navigator.clipboard.write([item]);

      toast.success("Copied QR code to clipboard!");
      onCopySuccess?.();
    } catch (error) {
      console.error("[useQrDownloads] Copy to clipboard failed:", error);
      toast.error("Failed to copy to clipboard");
    }
  }, [qrData, onCopySuccess]);

  const copyUrl = useCallback(
    async (url: string) => {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Copied link to clipboard!");
        onCopySuccess?.();
      } catch (error) {
        console.error("[useQrDownloads] Copy URL failed:", error);
        toast.error("Failed to copy link");
      }
    },
    [onCopySuccess],
  );

  return {
    anchorRef,
    downloadPng,
    downloadSvg,
    downloadJpeg,
    copyImage,
    copyUrl,
  };
}
