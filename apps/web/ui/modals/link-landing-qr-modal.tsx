"use client";

import {
  QR_ONBOARDING_SOURCE_PARAM,
  QR_ONBOARDING_SOURCE_VALUE,
} from "@/lib/onboarding/qr";
import { setQROnboardingSeedCookie } from "@/lib/onboarding/qr/cookie";
import { getQRData } from "@/lib/qr";
import { frameStyleToFrameType } from "@/lib/qr/types";
import type { QRLinkProps } from "@/lib/types";
import {
  DraftControls,
  DraftControlsHandle,
} from "@/ui/links/link-builder/draft-controls";
import {
  LinkBuilderProvider,
  LinkFormData,
  useLinkBuilderContext,
} from "@/ui/links/link-builder/link-builder-provider";
import {
  LANDING_DRAFT_STORAGE_KEY,
  readDraftsFromStorage,
  useLinkDrafts,
} from "@/ui/modals/link-builder/use-link-drafts";
// DownloadPopover/CopyPopover removed - users go to account creation to download
import { LinkQRModalProvider } from "@/ui/modals/link-qr-modal.context";
import {
  DEFAULT_QR_CODE_DESIGN,
  QRCodeDesign,
} from "@/ui/modals/link-qr-modal.types";
import { QRColorSection } from "@/ui/modals/link-qr-modal/QRColorSection";
import { QRCustomizationSection } from "@/ui/modals/link-qr-modal/QRCustomizationSection";
import { QRCode } from "@/ui/shared/qr-code";
import { Button, Modal, ShimmerDots, useMediaQuery } from "@dub/ui";
import { APP_DOMAIN, cn } from "@dub/utils";
import { AnimatePresence, motion } from "motion/react";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useFormContext } from "react-hook-form";

/**
 * Synchronously compute initial seeds by merging optional seeds
 * over the latest landing draft. Avoids first-paint flash of defaults.
 */
function computeInitialSeeds(
  seedUrl?: string,
  seedDraft?: Partial<QRCodeDesign>,
): {
  initialValues: Partial<LinkFormData>;
  initialQrDraft: QRCodeDesign | undefined;
} {
  const drafts = readDraftsFromStorage(LANDING_DRAFT_STORAGE_KEY);
  const latest = drafts[0];

  const values: Partial<LinkFormData> = {
    ...(latest?.link ?? {}),
    ...(seedUrl ? { url: seedUrl } : {}),
  };

  const qrDraft =
    (seedDraft
      ? { ...(latest?.qrDesign ?? DEFAULT_QR_CODE_DESIGN), ...seedDraft }
      : latest?.qrDesign) ?? undefined;

  return { initialValues: values, initialQrDraft: qrDraft };
}

type LinkLandingQRModalProps = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  title?: string;
  ctaText?: string;
  seedUrl?: string;
  seedDraft?: Partial<QRCodeDesign>;
};

export function LinkLandingQRModal({
  open,
  onOpenChange,
  title,
  ctaText,
  seedUrl,
  seedDraft,
}: LinkLandingQRModalProps) {
  // Compute seeds synchronously, merge seeds over latest draft
  const seeds = useMemo(
    () => computeInitialSeeds(seedUrl, seedDraft),
    [seedUrl, seedDraft],
  );

  return (
    <Modal
      showModal={open}
      setShowModal={
        onOpenChange as unknown as Dispatch<SetStateAction<boolean>>
      }
      className="sm:max-w-2xl"
      onClose={() => onOpenChange(false)}
    >
      <LinkBuilderProvider
        modal
        workspace={{}}
        initialValues={seeds.initialValues}
        initialQrDraftDesign={seeds.initialQrDraft}
      >
        <LinkLandingQRModalInner
          title={title ?? "Create a QR code"}
          ctaText={ctaText ?? "Click to download"}
          onClose={() => onOpenChange(false)}
        />
      </LinkBuilderProvider>
    </Modal>
  );
}

/**
 * Inline version of the landing QR creator (no modal).
 * Keeps the same UI and initialization, suitable for embedding on the page.
 */
export function LinkLandingQRCreator({
  seedUrl,
  seedDraft,
}: {
  seedUrl?: string;
  seedDraft?: Partial<QRCodeDesign>;
}) {
  const seeds = useMemo(
    () => computeInitialSeeds(seedUrl, seedDraft),
    [seedUrl, seedDraft],
  );

  return (
    <div className="w-full">
      <LinkBuilderProvider
        modal={false}
        workspace={{}}
        initialValues={seeds.initialValues}
        initialQrDraftDesign={seeds.initialQrDraft}
      >
        <LinkLandingQRModalInner
          title="Create a QR code"
          ctaText="Click to download"
          onClose={() => {}}
        />
      </LinkBuilderProvider>
    </div>
  );
}

function LinkLandingQRModalInner({
  ctaText,
  onClose,
}: {
  title: string;
  ctaText: string;
  onClose: () => void;
}) {
  const id = useId();
  const { isMobile } = useMediaQuery();
  const { register, watch } = useFormContext<LinkFormData>();
  const { qrDraftDesign } = useLinkBuilderContext();

  const draftControlsRef = useRef<DraftControlsHandle>(null);
  const landingDraftsAPI = useLinkDrafts({
    storageKey: LANDING_DRAFT_STORAGE_KEY,
  });

  useEffect(() => {
    return () => {
      draftControlsRef.current?.onClose();
    };
  }, []);

  const handleContinue = () => {
    const params = new URLSearchParams({
      next: "/onboarding/plan",
      [QR_ONBOARDING_SOURCE_PARAM]: QR_ONBOARDING_SOURCE_VALUE,
    });
    // Use full URL to ensure cross-domain navigation from custom domains
    // Flush any pending draft saves before navigation
    draftControlsRef.current?.onClose();

    // Persist QR onboarding seed cookie for cross-subdomain handoff
    setQROnboardingSeedCookie({
      url: url ?? "",
      qrDesign: draft,
      timestamp: Date.now(),
      id: "landing",
    });

    window.location.href = `${APP_DOMAIN}/register?${params.toString()}`;
  };

  // Logo is not used in landing page QR creator
  const logo = undefined;

  // Local QR state seeded from provider's initial design
  const [draft, setDraft] = useState<QRCodeDesign>(
    qrDraftDesign ?? DEFAULT_QR_CODE_DESIGN,
  );

  // Keep local draft in sync when provider's seed changes
  useEffect(() => {
    if (qrDraftDesign) {
      setDraft(qrDraftDesign);
    }
  }, [qrDraftDesign]);

  // Derive URL directly from form
  const url = watch("url");

  const frameOptions = useMemo(() => {
    const style = draft.qrFrameStyle;
    if (!style) return undefined;
    const type = frameStyleToFrameType(style);
    if (!type) return undefined;
    return {
      type,
      color: draft.qrFrameColor || draft.fgColor,
    };
  }, [draft.qrFrameStyle, draft.qrFrameColor, draft.fgColor]);

  const qrData = useMemo(() => {
    if (!url) return null;
    return getQRData({
      url,
      hideLogo: draft.qrHideLogo,
      logo: undefined,
      fgColor: draft.qrDotsColor || draft.fgColor,
      dotsOptions: {
        type: draft.qrDotType,
        color: draft.qrDotsColor || draft.fgColor,
      },
      eyeOptions: {
        cornerSquare: {
          type: draft.qrCornerSquareType,
          color: draft.qrCornerSquareColor || draft.fgColor,
        },
        cornerDot: {
          type: draft.qrCornerDotType,
          color: draft.qrCornerDotColor || draft.fgColor,
        },
      },
      frameOptions,
    });
  }, [url, draft, frameOptions]);

  // Minimal link props for naming in DownloadPopover
  const linkProps = useMemo(() => {
    return {
      domain: "dub.sh",
      key: "qr-code",
    } as QRLinkProps;
  }, []);

  // Context provider value for QR sections + preview
  const providerValue = useMemo(
    () => ({
      id,
      isMobile,
      plan: undefined as string | undefined,
      slug: undefined as string | undefined,
      draft,
      setDraft,
      url,
      logo: undefined as string | undefined,
      hideLogo: draft.qrHideLogo,
      frameOptions,
      qrData,
      qrDataForActions: qrData,
      linkProps,
      save: () => {
        // No explicit save in landing; autosave handles persistence
      },
      close: onClose,
    }),
    [
      id,
      isMobile,
      draft,
      setDraft,
      url,
      frameOptions,
      qrData,
      linkProps,
      onClose,
    ],
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <LinkQRModalProvider value={providerValue}>
        <div className="flex flex-col gap-3">
          {/* URL input - spans full two-column width */}
          <div className="mx-auto w-[90%] sm:w-4/5 lg:w-full">
            <div className="space-y-1">
              <label
                htmlFor={`${id}-destination-url`}
                className="block text-center text-base font-semibold text-neutral-900"
              >
                Destination URL
              </label>
              <input
                id={`${id}-destination-url`}
                type="url"
                placeholder="https://your-destination.com"
                className={cn(
                  "h-14 w-full rounded-xl border-2 border-neutral-200 px-5 text-center text-lg outline-none transition-all duration-200",
                  "placeholder:text-neutral-400",
                  "focus:border-blue-500 focus:shadow-lg focus:shadow-blue-100 focus:ring-0",
                  "hover:border-neutral-300",
                )}
                {...register("url")}
              />
            </div>
          </div>

          {/* Two equal-sized cards side by side */}
          <div className="mx-auto grid w-[90%] gap-4 sm:w-4/5 lg:w-full lg:grid-cols-2">
            {/* Left card: QR Preview - matches height of customization card */}
            <div className="relative overflow-hidden">
              {/* Decorative background elements */}
              <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-40 blur-xl" />

              {/* Main preview container - height matches customization card */}
              <div className="relative flex h-full min-h-[400px] flex-col rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg">
                <div
                  className="relative flex flex-1 items-center justify-center overflow-hidden rounded-xl border-2 border-neutral-100 bg-gradient-to-br from-neutral-50 to-white"
                  suppressHydrationWarning
                >
                  {!isMobile && (
                    <ShimmerDots className="opacity-20 [mask-image:radial-gradient(50%_50%,transparent_30%,black)]" />
                  )}
                  {url && (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={
                          draft.fgColor +
                          draft.qrHideLogo +
                          draft.qrDotType +
                          draft.qrCornerSquareType +
                          draft.qrCornerDotType +
                          draft.qrShape +
                          draft.hasFrame +
                          (draft.qrFrameStyle || "") +
                          (draft.qrFrameColor || "") +
                          (draft.qrDotsColor || "") +
                          (draft.qrCornerSquareColor || "") +
                          (draft.qrCornerDotColor || "")
                        }
                        initial={{
                          filter: "blur(4px)",
                          opacity: 0,
                          scale: 0.92,
                        }}
                        animate={{
                          filter: "blur(0px)",
                          opacity: 1,
                          scale: 1,
                        }}
                        exit={{
                          filter: "blur(4px)",
                          opacity: 0,
                          scale: 0.92,
                        }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="relative flex size-full items-center justify-center p-2"
                      >
                        <div className="flex w-full max-w-md items-center justify-center">
                          <QRCode
                            url={url}
                            fgColor={draft.qrDotsColor || draft.fgColor}
                            hideLogo={draft.qrHideLogo}
                            logo={logo}
                            scale={2.2}
                            qrShape={draft.qrShape}
                            dotsOptions={{
                              type: draft.qrDotType,
                              color: draft.qrDotsColor || draft.fgColor,
                            }}
                            eyeOptions={{
                              cornerSquare: {
                                type: draft.qrCornerSquareType,
                                color:
                                  draft.qrCornerSquareColor || draft.fgColor,
                              },
                              cornerDot: {
                                type: draft.qrCornerDotType,
                                color: draft.qrCornerDotColor || draft.fgColor,
                              },
                            }}
                            frameOptions={frameOptions}
                          />
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  )}
                  {!url && (
                    <p className="text-sm font-medium text-neutral-500">
                      Enter a URL above to generate your QR code
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right card: Customization - same size as preview card */}
            <div className="flex min-h-[400px] flex-col rounded-2xl border border-neutral-200 bg-neutral-50 p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-neutral-900">
                Customize Your QR Code
              </h3>
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
                {/* Logo, Dot Pattern, Corner Eyes */}
                <div className="flex flex-col gap-4">
                  <QRCustomizationSection />
                </div>

                {/* Colors at the bottom */}
                <div className="flex flex-col gap-4">
                  <QRColorSection />
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons - always visible, disabled until URL entered */}
          <div className="mx-auto w-[90%] sm:w-4/5 lg:w-full">
            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
                text={ctaText}
                onClick={handleContinue}
                disabled={!url || !qrData}
                disabledTooltip={
                  !url || !qrData
                    ? "Enter a destination URL to continue"
                    : undefined
                }
                className="h-11 w-full text-sm font-medium"
              />
              {/* DraftControls hidden but rendered to maintain autosave/restore functionality */}
              <div className="hidden">
                <DraftControls
                  ref={draftControlsRef}
                  workspaceId="landing"
                  persistenceOverride={landingDraftsAPI}
                  qrDesignFromModal={draft}
                  onRestoreQrDesignFromDraft={(d) =>
                    setDraft(d ?? DEFAULT_QR_CODE_DESIGN)
                  }
                  pendingOnSwitch="flush"
                  debounceMs={1000}
                />
              </div>
            </div>
          </div>
        </div>
      </LinkQRModalProvider>
    </div>
  );
}
