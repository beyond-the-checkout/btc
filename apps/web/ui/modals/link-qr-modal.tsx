import {
  buildQrRenderData,
  canToggleLogo,
  getQRAsCanvas,
  getQRData,
  resolveLogo,
  toQRDataInput,
} from "@/lib/qr";
import { useQrDownloads } from "@/lib/qr/use-qr-downloads";
import useDomain from "@/lib/swr/use-domain";
import useWorkspace from "@/lib/swr/use-workspace";
import { QRLinkProps } from "@/lib/types";
import type { QRCodeDesign } from "@/ui/modals/link-qr-modal.types";
import { DEFAULT_QR_CODE_DESIGN } from "@/ui/modals/link-qr-modal.types";
import {
  Button,
  IconMenu,
  Modal,
  Popover,
  SimpleTooltipContent,
  Tooltip,
  useCopyToClipboard,
  useMediaQuery,
} from "@dub/ui";
import { Check, Hyperlink, Photo } from "@dub/ui/icons";
import { API_DOMAIN, linkConstructor } from "@dub/utils";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type JSX,
} from "react";
import { toast } from "sonner";
import { BaseBadgeTooltip } from "../shared/pro-badge-tooltip";
import { CONTENT_MAX_HEIGHT_OFFSET } from "./link-qr-modal.constants";
import { LinkQRModalProvider } from "./link-qr-modal.context";
import { QRColorSection } from "./link-qr-modal/QRColorSection";
import { QRCustomizationSection } from "./link-qr-modal/QRCustomizationSection";
import { QRLogoSection } from "./link-qr-modal/QRLogoSection";
import { QRPreviewSection } from "./link-qr-modal/QRPreviewSection";
export type { QRCodeDesign } from "@/ui/modals/link-qr-modal.types";

// Using shared QRCodeDesign from link-qr-modal.types

type LinkQRModalProps = {
  props: QRLinkProps;
  onSave?: (data: QRCodeDesign) => void;
  // Controlled mode (optional)
  draftQrDesign?: QRCodeDesign;
  onDraftQrDesignChange?: (d: QRCodeDesign) => void;
};

function LinkQRModal(
  props: {
    showLinkQRModal: boolean;
    setShowLinkQRModal: Dispatch<SetStateAction<boolean>>;
  } & LinkQRModalProps,
) {
  return (
    <Modal
      showModal={props.showLinkQRModal}
      setShowModal={props.setShowLinkQRModal}
      className="max-w-[500px]"
    >
      <LinkQRModalInner {...props} />
    </Modal>
  );
}

/**
 * Internal section components
 */
type QRModalFooterProps = {
  onCancel: () => void;
};

function QRModalHeader(): JSX.Element {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">QR Code</h3>
          <BaseBadgeTooltip
            content={
              <SimpleTooltipContent title="Set a custom QR code design to improve click-through rates." />
            }
          />
        </div>
        <div className="max-md:hidden">
          <Tooltip
            content={
              <div className="px-2 py-1 text-xs text-neutral-700">
                Press{" "}
                <strong className="font-medium text-neutral-950">Q</strong> to
                open this quickly
              </div>
            }
            side="right"
          >
            <kbd className="flex size-6 cursor-default items-center justify-center rounded-md border border-neutral-200 font-sans text-xs text-neutral-950">
              Q
            </kbd>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

function QRModalContent(): JSX.Element {
  return (
    <>
      <div
        className="scrollbar-hide overflow-auto px-4 pb-4"
        style={{ maxHeight: `calc(100dvh - ${CONTENT_MAX_HEIGHT_OFFSET}px)` }}
      >
        <div className="flex flex-col gap-6">
          <QRPreviewSection />
          <QRLogoSection />
          <QRCustomizationSection />
          <QRColorSection />
        </div>
      </div>
    </>
  );
}

function QRModalFooter({ onCancel }: QRModalFooterProps): JSX.Element {
  return (
    <div className="flex items-center justify-end gap-2 border-t border-neutral-100 bg-neutral-50 p-4">
      <Button
        type="button"
        variant="secondary"
        text="Cancel"
        className="h-9 w-fit"
        onClick={onCancel}
      />
      <Button
        type="submit"
        variant="primary"
        text="Save changes"
        className="h-9 w-fit"
      />
    </div>
  );
}

function LinkQRModalInner({
  props,
  onSave,
  draftQrDesign,
  onDraftQrDesignChange,
  showLinkQRModal,
  setShowLinkQRModal,
}: {
  showLinkQRModal: boolean;
  setShowLinkQRModal: Dispatch<SetStateAction<boolean>>;
} & LinkQRModalProps) {
  const { id: workspaceId, slug, plan, logo: workspaceLogo } = useWorkspace();
  const id = useId();
  const { isMobile } = useMediaQuery();
  const { logo: domainLogo } = useDomain({
    slug: props.domain,
    enabled: showLinkQRModal,
  });

  const url = useMemo(() => {
    return props.key && props.domain
      ? linkConstructor({ key: props.key, domain: props.domain })
      : undefined;
  }, [props.key, props.domain]);

  // Use parent's draft design or fall back to defaults
  const baseDesign = useMemo(() => {
    return draftQrDesign ?? DEFAULT_QR_CODE_DESIGN;
  }, [draftQrDesign]);

  // Local draft state: edits apply here and only persist on Save
  const [draft, setDraft] = useState<QRCodeDesign>(baseDesign);

  // Wrapped setDraft that propagates all changes to parent
  const wrappedSetDraft = useCallback(
    (updater: SetStateAction<QRCodeDesign>) => {
      setDraft((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        onDraftQrDesignChange?.(next);
        return next;
      });
    },
    [onDraftQrDesignChange],
  );

  // Always sync local draft with latest baseDesign to prevent stale state
  // This keeps preview in sync even when restoring drafts while closed
  useEffect(() => {
    setDraft(baseDesign);
  }, [baseDesign]);

  // Use centralized logo resolution
  const logo = resolveLogo("link-modal", plan, workspaceLogo, domainLogo);
  const hideLogo = draft.qrHideLogo && canToggleLogo("link-modal", plan);

  // Build QR render data using centralized utility
  const renderData = useMemo(
    () =>
      url
        ? buildQrRenderData(draft, {
            url,
            logo,
            hideLogo,
          })
        : null,
    [url, draft, logo, hideLogo],
  );

  // Frame options derived from render data for context compatibility
  const frameOptions = renderData?.frameOptions;

  // Convert to getQRData format
  const qrData = useMemo(
    () => (renderData ? toQRDataInput(renderData) : null),
    [renderData],
  );

  const qrDataForActions = useMemo(
    () => (qrData ? { ...qrData, frameOptions } : null),
    [qrData, frameOptions],
  );

  const close = () => setShowLinkQRModal(false);

  const save = () => {
    // Final sync before closing (wrappedSetDraft already propagated changes)
    onDraftQrDesignChange?.(draft);
    setShowLinkQRModal(false);
    onSave?.(draft);
  };

  const contextValue = {
    // state
    id,
    isMobile,
    plan,
    slug,
    draft,
    setDraft: wrappedSetDraft,
    // derived
    url,
    logo,
    hideLogo,
    frameOptions,
    qrData,
    qrDataForActions,
    // external
    linkProps: props,
    // actions
    save,
    close,
  };

  return (
    <form
      className="flex flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        // Final sync before closing (wrappedSetDraft already propagated changes)
        onDraftQrDesignChange?.(draft);
        setShowLinkQRModal(false);
        onSave?.(draft);
      }}
    >
      <LinkQRModalProvider value={contextValue}>
        <QRModalHeader />
        <QRModalContent />
        <QRModalFooter onCancel={() => setShowLinkQRModal(false)} />
      </LinkQRModalProvider>
    </form>
  );
}

export function DownloadPopover({
  qrData,
  props,
  children,
}: PropsWithChildren<{
  qrData: ReturnType<typeof getQRData>;
  props: QRLinkProps;
}>) {
  const [openPopover, setOpenPopover] = useState(false);

  const { anchorRef, downloadSvg, downloadPng, downloadJpeg } = useQrDownloads({
    qrData,
    mode: "dynamic",
    linkKey: props.key,
    linkDomain: props.domain,
    onDownloadSuccess: () => setOpenPopover(false),
  });

  return (
    <div>
      <Popover
        content={
          <div className="grid p-1 sm:min-w-48">
            <button
              type="button"
              onClick={downloadSvg}
              className="rounded-md p-2 text-left text-sm font-medium text-neutral-500 transition-all duration-75 hover:bg-neutral-100"
            >
              <IconMenu
                text="Download SVG"
                icon={<Photo className="h-4 w-4" />}
              />
            </button>
            <button
              type="button"
              onClick={downloadPng}
              className="rounded-md p-2 text-left text-sm font-medium text-neutral-500 transition-all duration-75 hover:bg-neutral-100"
            >
              <IconMenu
                text="Download PNG"
                icon={<Photo className="h-4 w-4" />}
              />
            </button>
            <button
              type="button"
              onClick={downloadJpeg}
              className="rounded-md p-2 text-left text-sm font-medium text-neutral-500 transition-all duration-75 hover:bg-neutral-100"
            >
              <IconMenu
                text="Download JPEG"
                icon={<Photo className="h-4 w-4" />}
              />
            </button>
          </div>
        }
        openPopover={openPopover}
        setOpenPopover={setOpenPopover}
      >
        {children}
      </Popover>
      {/* Hidden anchor for download trigger */}
      <a className="hidden" ref={anchorRef} />
    </div>
  );
}

export function CopyPopover({
  qrData,
  props,
  children,
}: PropsWithChildren<{
  qrData: ReturnType<typeof getQRData>;
  props: QRLinkProps;
}>) {
  const [openPopover, setOpenPopover] = useState(false);
  const [copiedURL, copyUrlToClipboard] = useCopyToClipboard(2000);
  const [copiedImage, copyImageToClipboard] = useCopyToClipboard(2000);

  const copyToClipboard = async () => {
    try {
      const canvas = await getQRAsCanvas(qrData, "image/png", true);
      (canvas as HTMLCanvasElement).toBlob(async function (blob) {
        // @ts-ignore
        const item = new ClipboardItem({ "image/png": blob });
        await copyImageToClipboard(item);
        setOpenPopover(false);
      });
    } catch (e) {
      throw e;
    }
  };

  return (
    <Popover
      content={
        <div className="grid p-1 sm:min-w-48">
          <button
            type="button"
            onClick={async () => {
              toast.promise(copyToClipboard, {
                loading: "Copying QR code to clipboard...",
                success: "Copied QR code to clipboard!",
                error: "Failed to copy",
              });
            }}
            className="rounded-md p-2 text-left text-sm font-medium text-neutral-500 transition-all duration-75 hover:bg-neutral-100"
          >
            <IconMenu
              text="Copy Image"
              icon={
                copiedImage ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Photo className="h-4 w-4" />
                )
              }
            />
          </button>
          <button
            type="button"
            onClick={() => {
              const url = `${API_DOMAIN}/qr?url=${linkConstructor({
                key: props.key,
                domain: props.domain,
                searchParams: {
                  qr: "1",
                },
              })}${qrData.hideLogo ? "&hideLogo=true" : ""}`;
              toast.promise(copyUrlToClipboard(url), {
                success: "Copied QR code URL to clipboard!",
              });
              setOpenPopover(false);
            }}
            className="rounded-md p-2 text-left text-sm font-medium text-neutral-500 transition-all duration-75 hover:bg-neutral-100"
          >
            <IconMenu
              text="Copy URL"
              icon={
                copiedURL ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Hyperlink className="h-4 w-4" />
                )
              }
            />
          </button>
        </div>
      }
      openPopover={openPopover}
      setOpenPopover={setOpenPopover}
    >
      {children}
    </Popover>
  );
}

export function useLinkQRModal(props: LinkQRModalProps) {
  const [showLinkQRModal, setShowLinkQRModal] = useState(false);

  const LinkQRModalCallback = useCallback(() => {
    return (
      <LinkQRModal
        showLinkQRModal={showLinkQRModal}
        setShowLinkQRModal={setShowLinkQRModal}
        {...props}
      />
    );
  }, [showLinkQRModal, setShowLinkQRModal]);

  return useMemo(
    () => ({
      setShowLinkQRModal,
      LinkQRModal: LinkQRModalCallback,
    }),
    [setShowLinkQRModal, LinkQRModalCallback],
  );
}
