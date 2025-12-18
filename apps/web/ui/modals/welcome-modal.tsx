import {
  getQROnboardingSource,
  isQROnboarding,
  QR_ONBOARDING_SOURCE_PARAM,
} from "@/lib/onboarding/qr";
import {
  clearQROnboardingSeedCookie,
  readQROnboardingSeedCookie,
  type QROnboardingSeed,
} from "@/lib/onboarding/qr/cookie";
import { dispatchQROnboardingSeed } from "@/lib/onboarding/qr/events";
import {
  buildQrFilename,
  buildQrRenderData,
  getQRAsCanvas,
  getQRAsSVGDataUri,
  resolveLogo,
  toQRDataInput,
} from "@/lib/qr";
import useWorkspace from "@/lib/swr/use-workspace";
import { trackConversion, TrackSignup } from "@/lib/tracking-pixels";
import {
  LANDING_DRAFT_STORAGE_KEY,
  readDraftsFromStorage,
} from "@/ui/modals/link-builder/use-link-drafts";
import { ModalContext } from "@/ui/modals/modal-provider";
import { QRCode } from "@/ui/shared/qr-code";
import {
  Button,
  LoadingSpinner,
  Modal,
  useRouterStuff,
  useScrollProgress,
} from "@dub/ui";
import {
  cn,
  getPlanDetails,
  linkConstructor,
  PLANS,
  PRO_PLAN,
} from "@dub/utils";
import { usePlausible } from "next-plausible";
import { useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { brandName } from "../../lib/branding";
import { ModalHero } from "../shared/modal-hero";
import { PlanFeatures } from "../workspaces/plan-features";

// Keys to clear from URL when dismissing/consuming WelcomeModal (module-scoped)
const WELCOME_QUERY_KEYS_TO_CLEAR = [
  "onboarded",
  QR_ONBOARDING_SOURCE_PARAM,
  "upgraded",
  "plan",
  "period",
  "qrLinkId", // New: clear the QR link ID
] as const;

// Type for the link data we fetch
type FetchedLink = {
  id: string;
  domain: string;
  key: string;
  url: string;
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

function WelcomeModal({
  showWelcomeModal,
  setShowWelcomeModal,
}: {
  showWelcomeModal: boolean;
  setShowWelcomeModal: Dispatch<SetStateAction<boolean>>;
}) {
  const { setShowLinkBuilder } = useContext(ModalContext);
  const { queryParams } = useRouterStuff();
  const searchParams = useSearchParams();
  const { id: workspaceId, plan } = useWorkspace();

  const scrollRef = useRef<HTMLDivElement>(null);
  const downloadAnchorRef = useRef<HTMLAnchorElement>(null);
  const { scrollProgress, updateScrollProgress } = useScrollProgress(scrollRef);

  const planId = searchParams.get("plan");
  const qrLinkId = searchParams.get("qrLinkId");
  const plausible = usePlausible();

  // State for fetched link
  const [fetchedLink, setFetchedLink] = useState<FetchedLink | null>(null);
  const [loadingLink, setLoadingLink] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState<
    "png" | "svg" | null
  >(null);

  // Fetch link when qrLinkId is present
  useEffect(() => {
    if (!qrLinkId || !workspaceId || !showWelcomeModal) return;

    setLoadingLink(true);
    fetch(`/api/links/${qrLinkId}?workspaceId=${workspaceId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch link");
        return res.json();
      })
      .then((data) => {
        setFetchedLink(data);
      })
      .catch((err) => {
        console.error("Failed to fetch created link:", err);
      })
      .finally(() => {
        setLoadingLink(false);
      });
  }, [qrLinkId, workspaceId, showWelcomeModal]);

  const handlePlanUpgrade = async () => {
    if (planId) {
      const currentPlan = getPlanDetails(planId);
      const period = searchParams.get("period") as "monthly" | "yearly" | null;
      if (currentPlan && period) {
        plausible(`Upgraded to ${currentPlan.name}`);
        posthog.capture("plan_upgraded", {
          plan: currentPlan.name,
          period,
          revenue: currentPlan.price[period],
        });

        // Google Ads: track paid plan purchase with revenue
        const price = currentPlan.price[period];
        if (price != null) {
          trackConversion({
            type: "purchase",
            value: price,
            currency: "USD",
          });
        }
      }
    }
  };
  useEffect(() => {
    handlePlanUpgrade();
  }, [searchParams, planId]);

  const planInfo = planId
    ? PLANS.find(
        (p) => p.name.toLowerCase() === planId.replace("+", " ").toLowerCase(),
      ) ?? PRO_PLAN
    : undefined;

  // QR flow detection
  const onboarded = searchParams.get("onboarded") === "true";
  const isUpgrade = !!searchParams.get("upgraded") || !!planId;
  const source = getQROnboardingSource(searchParams);
  const isQrFlow = isQROnboarding(source);

  // Track signup conversion for new users (not upgrades)
  const shouldTrackSignup = onboarded && !isUpgrade;

  // Memoized latest QR seed (cookie preferred, then localStorage drafts)
  const latest:
    | { link?: { url?: string }; qrDesign?: QROnboardingSeed["qrDesign"] }
    | ReturnType<typeof readDraftsFromStorage>[number]
    | undefined = useMemo(() => {
    try {
      if (typeof window === "undefined") return undefined;
      const seed = readQROnboardingSeedCookie();
      if (seed) return { link: { url: seed.url }, qrDesign: seed.qrDesign };
      const drafts = readDraftsFromStorage(LANDING_DRAFT_STORAGE_KEY);
      return drafts.length > 0 ? drafts[0] : undefined;
    } catch {
      return undefined;
    }
  }, [showWelcomeModal, searchParams]);

  // Whether the seed came from cookie (affects CTA text)
  const fromCookie = useMemo(() => {
    try {
      if (typeof window === "undefined") return false;
      return !!readQROnboardingSeedCookie();
    } catch {
      return false;
    }
  }, [showWelcomeModal, searchParams]);

  // Determine which variant to show
  const shouldShowQrDownloadVariant = onboarded && isQrFlow && !!qrLinkId;
  const shouldShowQrResumeVariant =
    onboarded && isQrFlow && !qrLinkId && !!latest;

  // Use centralized logo resolution for welcome surface
  const logo = resolveLogo("welcome");

  // Compute QR data for the fetched link using centralized utilities
  const qrData = useMemo(() => {
    if (!fetchedLink) return null;
    const shortUrl = linkConstructor({
      domain: fetchedLink.domain,
      key: fetchedLink.key,
    });

    const seedDesign = latest?.qrDesign;

    // Merge fetched link data with seed design, preferring fetched values
    const mergedDesign = {
      fgColor: seedDesign?.fgColor ?? "#000000",
      qrHideLogo: fetchedLink.qrHideLogo ?? seedDesign?.qrHideLogo ?? false,
      qrDotType: (fetchedLink.qrDotType ??
        seedDesign?.qrDotType ??
        "square") as any,
      qrCornerSquareType: (fetchedLink.qrCornerSquareType ??
        seedDesign?.qrCornerSquareType ??
        "square") as any,
      qrCornerDotType: (fetchedLink.qrCornerDotType ??
        seedDesign?.qrCornerDotType ??
        "square") as any,
      qrShape: (fetchedLink.qrShape ?? seedDesign?.qrShape ?? "square") as
        | "square"
        | "circle",
      qrFrameStyle: (fetchedLink.qrFrameStyle ??
        seedDesign?.qrFrameStyle) as any,
      qrFrameColor: fetchedLink.qrFrameColor ?? seedDesign?.qrFrameColor,
      qrDotsColor: fetchedLink.qrDotsColor ?? seedDesign?.qrDotsColor,
      qrCornerSquareColor:
        fetchedLink.qrCornerSquareColor ?? seedDesign?.qrCornerSquareColor,
      qrCornerDotColor:
        fetchedLink.qrCornerDotColor ?? seedDesign?.qrCornerDotColor,
    };

    const renderData = buildQrRenderData(mergedDesign, {
      url: shortUrl,
      logo,
      hideLogo: mergedDesign.qrHideLogo,
    });

    return toQRDataInput(renderData);
  }, [fetchedLink, latest, logo]);

  // Common cleanup after successful download
  const cleanupAfterDownload = useCallback(() => {
    clearQROnboardingSeedCookie();
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(LANDING_DRAFT_STORAGE_KEY);
      }
    } catch {
      // no-op
    }
    queryParams({
      del: [...WELCOME_QUERY_KEYS_TO_CLEAR],
    });
    setShowWelcomeModal(false);
  }, [queryParams, setShowWelcomeModal]);

  // Download handler for PNG
  const handleDownloadQrPng = useCallback(async () => {
    if (!qrData || !downloadAnchorRef.current) return;
    setDownloadingFormat("png");
    try {
      const dataUrl = await getQRAsCanvas(qrData, "image/png");
      downloadAnchorRef.current.href = dataUrl as string;
      downloadAnchorRef.current.download = buildQrFilename({
        mode: "dynamic",
        extension: "png",
        linkKey: fetchedLink?.key,
        linkDomain: fetchedLink?.domain,
      });
      downloadAnchorRef.current.click();
      cleanupAfterDownload();
    } catch (err) {
      console.error("Failed to download QR PNG:", err);
    } finally {
      setDownloadingFormat(null);
    }
  }, [qrData, fetchedLink, cleanupAfterDownload]);

  // Download handler for SVG
  const handleDownloadQrSvg = useCallback(async () => {
    if (!qrData || !downloadAnchorRef.current) return;
    setDownloadingFormat("svg");
    try {
      const dataUrl = await getQRAsSVGDataUri(qrData);
      downloadAnchorRef.current.href = dataUrl;
      downloadAnchorRef.current.download = buildQrFilename({
        mode: "dynamic",
        extension: "svg",
        linkKey: fetchedLink?.key,
        linkDomain: fetchedLink?.domain,
      });
      downloadAnchorRef.current.click();
      cleanupAfterDownload();
    } catch (err) {
      console.error("Failed to download QR SVG:", err);
    } finally {
      setDownloadingFormat(null);
    }
  }, [qrData, fetchedLink, cleanupAfterDownload]);

  const handleResumeQr = useCallback((): void => {
    // Important: clear URL params BEFORE opening the builder to avoid ModalProvider re-triggering
    queryParams({
      del: [...WELCOME_QUERY_KEYS_TO_CLEAR],
    });

    // Close the welcome modal immediately
    setShowWelcomeModal(false);

    // Open builder next frame; seed after it's mounted
    requestAnimationFrame(() => {
      setShowLinkBuilder(true);
      requestAnimationFrame(() => {
        dispatchQROnboardingSeed({
          url: latest?.link?.url ?? "",
          qrDesign: latest?.qrDesign,
        });
        clearQROnboardingSeedCookie();
        try {
          if (typeof window !== "undefined") {
            localStorage.removeItem(LANDING_DRAFT_STORAGE_KEY);
          }
        } catch {
          // no-op
        }
      });
    });
  }, [latest, setShowLinkBuilder, setShowWelcomeModal, queryParams]);

  return (
    <Modal
      showModal={showWelcomeModal}
      setShowModal={setShowWelcomeModal}
      onClose={() =>
        queryParams({
          del: [...WELCOME_QUERY_KEYS_TO_CLEAR],
        })
      }
    >
      {/* Track signup conversion for new users completing onboarding */}
      {shouldTrackSignup && <TrackSignup />}
      <div className="flex flex-col">
        <ModalHero />
        <div className="px-6 py-8 sm:px-12">
          <div className="relative">
            <div
              ref={scrollRef}
              onScroll={updateScrollProgress}
              className="scrollbar-hide max-h-[calc(100vh-350px)] overflow-y-auto pb-6"
            >
              {shouldShowQrDownloadVariant ? (
                <>
                  <h1 className="text-center text-lg font-medium text-neutral-950">
                    Your dynamic QR code is ready
                  </h1>
                  <p className="mt-2 text-center text-sm text-neutral-500">
                    Download your QR code and start tracking scans. You can
                    update the destination URL anytime from your dashboard.
                  </p>
                  {/* QR Preview - uses pre-computed qrData from centralized utility */}
                  {loadingLink ? (
                    <div className="mt-6 flex justify-center">
                      <LoadingSpinner className="size-8" />
                    </div>
                  ) : fetchedLink && qrData ? (
                    <div className="mt-6 flex justify-center">
                      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                        <QRCode
                          url={linkConstructor({
                            domain: fetchedLink.domain,
                            key: fetchedLink.key,
                          })}
                          fgColor={qrData.fgColor}
                          hideLogo={qrData.hideLogo}
                          logo={logo}
                          scale={1.5}
                          qrShape={qrData.qrShape}
                          dotsOptions={qrData.dotsOptions}
                          eyeOptions={qrData.eyeOptions}
                          frameOptions={qrData.frameOptions}
                        />
                      </div>
                    </div>
                  ) : null}
                </>
              ) : shouldShowQrResumeVariant ? (
                <>
                  <h1 className="text-center text-lg font-medium text-neutral-950">
                    {fromCookie
                      ? "Finish your QR code"
                      : "Complete your QR code"}
                  </h1>
                  <p className="mt-2 text-center text-sm text-neutral-500">
                    We saved your design from the landing page. Open it in the
                    editor to finish.
                  </p>
                </>
              ) : (
                <>
                  <h1
                    className={cn(
                      "text-lg font-medium text-neutral-950",
                      planInfo ? "text-left" : "text-center",
                    )}
                  >
                    {planInfo
                      ? `${brandName(true)} ${planInfo.name} looks good on you!`
                      : `Welcome to ${brandName(false)}!`}
                  </h1>
                  <p
                    className={cn(
                      "mt-2 text-sm text-neutral-500",
                      planInfo ? "text-left" : "text-center",
                    )}
                  >
                    Thanks for signing up – your account is ready to go! Now you
                    have one central, organized place to build and manage all
                    your QR codes.
                  </p>
                  {planInfo && (
                    <>
                      <h2 className="mb-2 mt-6 text-base font-medium text-neutral-950">
                        Explore the benefits of your {planInfo.name} plan
                      </h2>
                      <PlanFeatures plan={planInfo.name} />
                    </>
                  )}
                </>
              )}
            </div>
            {/* Bottom scroll fade */}
            <div
              className="pointer-events-none absolute bottom-0 left-0 hidden h-16 w-full bg-gradient-to-t from-white sm:block"
              style={{ opacity: 1 - Math.pow(scrollProgress, 2) }}
            ></div>
          </div>
          {shouldShowQrDownloadVariant ? (
            <div className="mt-2 flex flex-col gap-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="primary"
                  text={
                    downloadingFormat === "png"
                      ? "Downloading..."
                      : "Download PNG"
                  }
                  loading={downloadingFormat === "png" || loadingLink}
                  disabled={
                    !fetchedLink || !qrData || downloadingFormat !== null
                  }
                  onClick={handleDownloadQrPng}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="primary"
                  text={
                    downloadingFormat === "svg"
                      ? "Downloading..."
                      : "Download SVG"
                  }
                  loading={downloadingFormat === "svg" || loadingLink}
                  disabled={
                    !fetchedLink || !qrData || downloadingFormat !== null
                  }
                  onClick={handleDownloadQrSvg}
                  className="flex-1"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                text="Close"
                onClick={() => {
                  queryParams({
                    del: [...WELCOME_QUERY_KEYS_TO_CLEAR],
                  });
                  setShowWelcomeModal(false);
                }}
              />
            </div>
          ) : shouldShowQrResumeVariant ? (
            <Button
              type="button"
              variant="primary"
              text={fromCookie ? "Resume your QR design" : "Open in editor"}
              className="mt-2"
              onClick={handleResumeQr}
            />
          ) : (
            <Button
              type="button"
              variant="primary"
              text="Get started"
              className="mt-2"
              onClick={() => {
                queryParams({
                  del: [...WELCOME_QUERY_KEYS_TO_CLEAR],
                });
                setShowWelcomeModal(false);
              }}
            />
          )}
        </div>
      </div>
      {/* Hidden anchor for triggering downloads */}
      <a ref={downloadAnchorRef} className="hidden" />
    </Modal>
  );
}

export function useWelcomeModal() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const WelcomeModalCallback = useCallback(() => {
    return (
      <WelcomeModal
        showWelcomeModal={showWelcomeModal}
        setShowWelcomeModal={setShowWelcomeModal}
      />
    );
  }, [showWelcomeModal, setShowWelcomeModal]);

  return useMemo(
    () => ({
      setShowWelcomeModal,
      WelcomeModal: WelcomeModalCallback,
    }),
    [setShowWelcomeModal, WelcomeModalCallback],
  );
}
