"use client";

import {
  QR_ONBOARDING_SOURCE_PARAM,
  QR_ONBOARDING_SOURCE_VALUE,
} from "@/lib/onboarding/qr";
import { setQROnboardingSeedCookie } from "@/lib/onboarding/qr/cookie";
import { buildQrRenderData, resolveLogo, toQRDataInput } from "@/lib/qr";
import { useQrDownloads } from "@/lib/qr/use-qr-downloads";
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
import { LinkQRModalProvider } from "@/ui/modals/link-qr-modal.context";
import {
  DEFAULT_QR_CODE_DESIGN,
  QRCodeDesign,
} from "@/ui/modals/link-qr-modal.types";
import { QRColorSection } from "@/ui/modals/link-qr-modal/QRColorSection";
import { QRCustomizationSection } from "@/ui/modals/link-qr-modal/QRCustomizationSection";
import { QRCode } from "@/ui/shared/qr-code";
import { Button, IconMenu, Modal, ShimmerDots, useMediaQuery } from "@dub/ui";
import { Photo, Sliders, Sparkle3 } from "@dub/ui/icons";
import { APP_DOMAIN, cn, nanoid } from "@dub/utils";

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
  ctaText,
}: {
  seedUrl?: string;
  seedDraft?: Partial<QRCodeDesign>;
  ctaText?: string;
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
          ctaText={ctaText ?? "Click to download"}
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

  // Customization panel expanded state
  const [isCustomizing, setIsCustomizing] = useState(false);

  // Download/Upgrade modal state
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  useEffect(() => {
    return () => {
      draftControlsRef.current?.onClose();
    };
  }, []);

  /**
   * Handle upgrade to dynamic QR code flow
   */
  function handleUpgradeToDynamic(): void {
    // Flush any pending draft saves before navigation
    draftControlsRef.current?.onClose();

    // Generate unique seed ID for idempotency and CSRF protection
    const seedId = nanoid(16);

    // Persist QR onboarding seed cookie for cross-subdomain handoff
    setQROnboardingSeedCookie({
      url: url ?? "",
      qrDesign: draft,
      timestamp: Date.now(),
      id: seedId,
    });

    // Navigate to register with next pointing to QR bootstrap route
    // Include seedId in URL for CSRF validation (must match cookie)
    const nextPath = `/onboarding/qr-landing?${QR_ONBOARDING_SOURCE_PARAM}=${QR_ONBOARDING_SOURCE_VALUE}&seedId=${seedId}`;
    const params = new URLSearchParams({
      next: nextPath,
      [QR_ONBOARDING_SOURCE_PARAM]: QR_ONBOARDING_SOURCE_VALUE,
    });
    window.location.href = `${APP_DOMAIN}/register?${params.toString()}`;
  }

  /**
   * Handle login link for existing users
   */
  function handleLoginExistingUser(): void {
    // Flush any pending draft saves before navigation
    draftControlsRef.current?.onClose();

    // Generate unique seed ID for idempotency and CSRF protection
    const seedId = nanoid(16);

    // Persist QR onboarding seed cookie for cross-subdomain handoff
    setQROnboardingSeedCookie({
      url: url ?? "",
      qrDesign: draft,
      timestamp: Date.now(),
      id: seedId,
    });

    // Navigate to login with next pointing to QR bootstrap route
    // Include seedId in URL for CSRF validation (must match cookie)
    const nextPath = `/onboarding/qr-landing?${QR_ONBOARDING_SOURCE_PARAM}=${QR_ONBOARDING_SOURCE_VALUE}&seedId=${seedId}`;
    const params = new URLSearchParams({
      next: nextPath,
      [QR_ONBOARDING_SOURCE_PARAM]: QR_ONBOARDING_SOURCE_VALUE,
    });
    window.location.href = `${APP_DOMAIN}/login?${params.toString()}`;
  }

  // Use centralized logo resolution for landing surface (always DUB_QR_LOGO)
  const logo = resolveLogo("landing");

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

  // Build QR render data using centralized utility
  const renderData = useMemo(() => {
    if (!url) return null;
    return buildQrRenderData(draft, {
      url,
      logo,
      hideLogo: draft.qrHideLogo,
    });
  }, [url, draft, logo]);

  // Frame options derived from render data for context compatibility
  const frameOptions = renderData?.frameOptions;

  // Convert to getQRData format
  const qrData = useMemo(
    () => (renderData ? toQRDataInput(renderData) : null),
    [renderData],
  );

  // Shared download hook for consistent QR downloads
  const {
    anchorRef: downloadAnchorRef,
    downloadPng,
    downloadSvg,
  } = useQrDownloads({
    qrData,
    mode: "static",
    destinationUrl: url ?? undefined,
    onDownloadSuccess: () => setShowDownloadModal(false),
  });

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
      logo, // Use resolved logo from centralized utility
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
      logo,
      frameOptions,
      qrData,
      linkProps,
      onClose,
    ],
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4">
      <LinkQRModalProvider value={providerValue}>
        <div className="flex flex-col gap-5">
          {/* URL input - expands to match cards width when customizing */}
          <div
            className={cn(
              "mx-auto w-full transition-all duration-500 ease-out",
              isCustomizing ? "lg:w-[912px]" : "lg:w-[448px]",
            )}
          >
            <div className="space-y-2">
              <label
                htmlFor={`${id}-destination-url`}
                className="block text-center text-base font-semibold text-neutral-900"
              >
                Destination URL
              </label>
              <input
                id={`${id}-destination-url`}
                type="url"
                placeholder="https://foreverqrs.com"
                className={cn(
                  "h-14 w-full rounded-xl border-2 border-neutral-200 px-5 text-center text-lg outline-none transition-all duration-200",
                  "placeholder:text-neutral-400",
                  "focus:border-neutral-900 focus:ring-0",
                  "hover:border-neutral-300",
                )}
                {...register("url")}
              />
            </div>
          </div>

          {/* QR Preview + Customization panel - flexbox layout */}
          <div className="flex justify-center">
            {/* Container always uses lg:flex-row so exit animation keeps customize panel to the right */}
            <div className="flex flex-col gap-4 lg:flex-row">
              {/* QR Preview Card - FIXED SIZE on desktop, responsive on mobile */}
              <div className="relative w-full flex-shrink-0 max-lg:max-w-md lg:w-[448px]">
                {/* Subtle glow effect */}
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-neutral-100 via-neutral-50 to-white opacity-60 blur-xl" />

                <div className="relative flex h-[620px] max-h-[calc(100vh-12rem)] flex-col rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm">
                  {/* QR Code Display */}
                  <div
                    className="relative flex flex-1 items-center justify-center overflow-hidden rounded-xl bg-neutral-50/50"
                    suppressHydrationWarning
                  >
                    {!isMobile && (
                      <ShimmerDots className="opacity-10 [mask-image:radial-gradient(50%_50%,transparent_40%,black)]" />
                    )}
                    {url ? (
                      <div
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
                        className="animate-fade-in relative flex size-full items-center justify-center p-4 motion-reduce:animate-none"
                      >
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
                              color: draft.qrCornerSquareColor || draft.fgColor,
                            },
                            cornerDot: {
                              type: draft.qrCornerDotType,
                              color: draft.qrCornerDotColor || draft.fgColor,
                            },
                          }}
                          frameOptions={frameOptions}
                        />
                      </div>
                    ) : (
                      <div
                        key="sample-qr"
                        className="animate-fade-in relative flex size-full flex-col items-center justify-center gap-4 p-4 motion-reduce:animate-none"
                      >
                        <QRCode
                          url="https://foreverqrs.com"
                          fgColor="#a3a3a3"
                          logo={logo}
                          scale={2.2}
                          qrShape="square"
                          dotsOptions={{
                            type: "square",
                            color: "#a3a3a3",
                          }}
                          eyeOptions={{
                            cornerSquare: {
                              type: "square",
                              color: "#a3a3a3",
                            },
                            cornerDot: {
                              type: "square",
                              color: "#a3a3a3",
                            },
                          }}
                        />
                        <p className="text-center text-sm text-neutral-400">
                          Enter a URL to generate your QR code
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Customize toggle button - sits at bottom of preview card */}
                  <button
                    type="button"
                    onClick={() => setIsCustomizing(!isCustomizing)}
                    className={cn(
                      "mt-4 flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors duration-200",
                      isCustomizing
                        ? "bg-neutral-900 text-white hover:bg-neutral-800"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
                    )}
                  >
                    <Sliders className="size-4" />
                    <span>Customize</span>
                  </button>
                </div>
              </div>

              {/* Customization Panel - slides in from right */}
              {isCustomizing && (
                <div className="animate-fade-in flex h-[620px] max-h-[calc(100vh-12rem)] w-full flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-5 shadow-sm backdrop-blur-sm motion-reduce:animate-none max-lg:max-w-md lg:w-[448px]">
                  <h3 className="mb-3 flex-shrink-0 text-sm font-semibold text-neutral-900">
                    Customize
                  </h3>
                  <div className="scrollbar-thin scrollbar-thumb-neutral-300/50 scrollbar-track-transparent hover:scrollbar-thumb-neutral-400/70 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
                    <QRCustomizationSection />
                    <QRColorSection />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CTA Button - expands to match cards width when customizing */}
          <div
            className={cn(
              "mx-auto w-full transition-all duration-500 ease-out",
              isCustomizing ? "lg:w-[912px]" : "lg:w-[448px]",
            )}
          >
            <Button
              variant="primary"
              text={ctaText}
              onClick={() => setShowDownloadModal(true)}
              disabled={!url || !qrData}
              disabledTooltip={
                !url ? "Enter a destination URL to continue" : undefined
              }
              className="h-12 w-full text-base font-medium"
            />
          </div>

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

          {/* Hidden anchor for triggering downloads */}
          <a ref={downloadAnchorRef} className="hidden" />

          {/* Download / Upgrade Modal */}
          <Modal
            showModal={showDownloadModal}
            setShowModal={setShowDownloadModal}
            className="sm:max-w-md"
          >
            <div className="flex flex-col p-6">
              <h2 className="mb-2 text-lg font-semibold text-neutral-900">
                Download your QR code
              </h2>
              <p className="mb-6 text-sm text-neutral-500">
                Choose to download a static QR code or upgrade to a dynamic one
                for free to track scans and update the destination anytime.
              </p>

              {/* Static Download Section */}
              <div className="mb-6">
                <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Static QR Code
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={downloadPng}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                  >
                    <IconMenu
                      text="Download PNG"
                      icon={<Photo className="h-4 w-4" />}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={downloadSvg}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                  >
                    <IconMenu
                      text="Download SVG"
                      icon={<Photo className="h-4 w-4" />}
                    />
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-neutral-400">or</span>
                </div>
              </div>

              {/* Upgrade Section */}
              <div>
                <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Dynamic QR Code
                </h3>
                <p className="mb-3 text-sm text-neutral-600">
                  Create a free account to get a dynamic QR code that lets you:
                </p>
                <ul className="mb-4 space-y-1.5 text-sm text-neutral-600">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Track scans and analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Update destination URL anytime
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Customize design after creation
                  </li>
                </ul>
                <Button
                  variant="primary"
                  text="Upgrade to Dynamic (Free)"
                  onClick={handleUpgradeToDynamic}
                  icon={<Sparkle3 className="h-4 w-4" />}
                  className="h-11 w-full"
                />
                <button
                  type="button"
                  onClick={handleLoginExistingUser}
                  className="mt-3 w-full text-center text-sm text-neutral-500 hover:text-neutral-700"
                >
                  Already have an account?{" "}
                  <span className="font-medium underline">Log in</span>
                </button>
              </div>
            </div>
          </Modal>
        </div>
      </LinkQRModalProvider>
    </div>
  );
}
