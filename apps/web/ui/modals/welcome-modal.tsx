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
import { getQRAsCanvas, getQRData } from "@/lib/qr";
import { frameStyleToFrameType } from "@/lib/qr/types";
import useWorkspace from "@/lib/swr/use-workspace";
import { trackConversion } from "@/lib/tracking-pixels";
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
  DUB_QR_LOGO,
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
  const [downloading, setDownloading] = useState(false);

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
  const source = getQROnboardingSource(searchParams);
  const isQrFlow = isQROnboarding(source);

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

  // Compute QR data for the fetched link
  const qrData = useMemo(() => {
    if (!fetchedLink) return null;
    const shortUrl = linkConstructor({
      domain: fetchedLink.domain,
      key: fetchedLink.key,
    });

    const frameType = frameStyleToFrameType(
      fetchedLink.qrFrameStyle as
        | "square"
        | "rounded"
        | "solid-circle"
        | "dotted-circle"
        | undefined,
    );
    const frameOptions = frameType
      ? {
          type: frameType,
          color:
            fetchedLink.qrFrameColor || fetchedLink.qrDotsColor || "#000000",
        }
      : undefined;

    return getQRData({
      url: shortUrl,
      hideLogo: fetchedLink.qrHideLogo ?? false,
      logo: DUB_QR_LOGO,
      fgColor: fetchedLink.qrDotsColor || "#000000",
      qrShape: (fetchedLink.qrShape as "square" | "circle") || "square",
      dotsOptions: {
        type: (fetchedLink.qrDotType as any) || "square",
        color: fetchedLink.qrDotsColor || "#000000",
      },
      eyeOptions: {
        cornerSquare: {
          type: (fetchedLink.qrCornerSquareType as any) || "square",
          color: fetchedLink.qrCornerSquareColor || "#000000",
        },
        cornerDot: {
          type: (fetchedLink.qrCornerDotType as any) || "square",
          color: fetchedLink.qrCornerDotColor || "#000000",
        },
      },
      frameOptions,
    });
  }, [fetchedLink]);

  // Download handler for the dynamic QR
  const handleDownloadQrPng = useCallback(async () => {
    if (!qrData || !downloadAnchorRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await getQRAsCanvas(qrData, "image/png");
      downloadAnchorRef.current.href = dataUrl as string;
      downloadAnchorRef.current.download = `qr-code-${fetchedLink?.key || "download"}.png`;
      downloadAnchorRef.current.click();

      // Clear artifacts after successful download
      clearQROnboardingSeedCookie();
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem(LANDING_DRAFT_STORAGE_KEY);
        }
      } catch {
        // no-op
      }

      // Clear URL params and close modal
      queryParams({
        del: [...WELCOME_QUERY_KEYS_TO_CLEAR],
      });
      setShowWelcomeModal(false);
    } catch (err) {
      console.error("Failed to download QR:", err);
    } finally {
      setDownloading(false);
    }
  }, [qrData, fetchedLink, queryParams, setShowWelcomeModal]);

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
                  {/* QR Preview */}
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
                          fgColor={fetchedLink.qrDotsColor || "#000000"}
                          hideLogo={fetchedLink.qrHideLogo ?? false}
                          logo={DUB_QR_LOGO}
                          scale={1.5}
                          qrShape={
                            (fetchedLink.qrShape as "square" | "circle") ||
                            "square"
                          }
                          dotsOptions={{
                            type: (fetchedLink.qrDotType as any) || "square",
                            color: fetchedLink.qrDotsColor || "#000000",
                          }}
                          eyeOptions={{
                            cornerSquare: {
                              type:
                                (fetchedLink.qrCornerSquareType as any) ||
                                "square",
                              color:
                                fetchedLink.qrCornerSquareColor || "#000000",
                            },
                            cornerDot: {
                              type:
                                (fetchedLink.qrCornerDotType as any) ||
                                "square",
                              color: fetchedLink.qrCornerDotColor || "#000000",
                            },
                          }}
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
              <Button
                type="button"
                variant="primary"
                text={downloading ? "Downloading..." : "Download PNG"}
                loading={downloading || loadingLink}
                disabled={!fetchedLink || !qrData}
                onClick={handleDownloadQrPng}
              />
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
