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
  LANDING_DRAFT_STORAGE_KEY,
  readDraftsFromStorage,
} from "@/ui/modals/link-builder/use-link-drafts";
import { ModalContext } from "@/ui/modals/modal-provider";
import { Button, Modal, useRouterStuff, useScrollProgress } from "@dub/ui";
import { cn, getPlanDetails, PLANS, PRO_PLAN } from "@dub/utils";
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

  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollProgress, updateScrollProgress } = useScrollProgress(scrollRef);

  const planId = searchParams.get("plan");
  const plausible = usePlausible();

  const handlePlanUpgrade = async () => {
    if (planId) {
      const currentPlan = getPlanDetails(planId);
      const period = searchParams.get("period");
      if (currentPlan && period) {
        plausible(`Upgraded to ${currentPlan.name}`);
        posthog.capture("plan_upgraded", {
          plan: currentPlan.name,
          period,
          revenue: currentPlan.price[period],
        });
      }
    }
  };
  useEffect(() => {
    handlePlanUpgrade();
  }, [searchParams, planId]);

  const plan = planId
    ? PLANS.find(
        (p) => p.name.toLowerCase() === planId.replace("+", " ").toLowerCase(),
      ) ?? PRO_PLAN
    : undefined;

  // QR flow detection and seed resolution
  const onboarded = searchParams.get("onboarded") === "true";
  const source = getQROnboardingSource(searchParams);
  const isQrFlow = isQROnboarding(source);

  let latest:
    | { link?: { url?: string }; qrDesign?: QROnboardingSeed["qrDesign"] }
    | ReturnType<typeof readDraftsFromStorage>[number]
    | undefined;
  let fromCookie = false;

  try {
    if (typeof window !== "undefined") {
      const seed = readQROnboardingSeedCookie();
      if (seed) {
        fromCookie = true;
        latest = { link: { url: seed.url }, qrDesign: seed.qrDesign };
      } else {
        const drafts = readDraftsFromStorage(LANDING_DRAFT_STORAGE_KEY);
        latest = drafts.length > 0 ? drafts[0] : undefined;
      }
    }
  } catch {
    latest = undefined;
    fromCookie = false;
  }

  const shouldShowQrVariant = onboarded && isQrFlow && !!latest;

  const handleResumeQr = useCallback((): void => {
    // 1) Clear URL gating params first to prevent ModalProvider from re-triggering
    queryParams({
      del: ["onboarded", QR_ONBOARDING_SOURCE_PARAM, "plan", "period"],
    });

    // 2) Close the welcome modal immediately
    setShowWelcomeModal(false);

    // 3) Next frames: open builder, then seed after it's mounted
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
          del: [
            "onboarded",
            QR_ONBOARDING_SOURCE_PARAM,
            "upgraded",
            "plan",
            "period",
          ],
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
              {shouldShowQrVariant ? (
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
                      plan ? "text-left" : "text-center",
                    )}
                  >
                    {plan
                      ? `${brandName(true)} ${plan.name} looks good on you!`
                      : `Welcome to ${brandName(false)}!`}
                  </h1>
                  <p
                    className={cn(
                      "mt-2 text-sm text-neutral-500",
                      plan ? "text-left" : "text-center",
                    )}
                  >
                    Thanks for signing up – your account is ready to go! Now you
                    have one central, organized place to build and manage all
                    your short links.
                  </p>
                  {plan && (
                    <>
                      <h2 className="mb-2 mt-6 text-base font-medium text-neutral-950">
                        Explore the benefits of your {plan.name} plan
                      </h2>
                      <PlanFeatures plan={plan.name} />
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
          {shouldShowQrVariant ? (
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
              onClick={() =>
                queryParams({
                  del: ["onboarded"],
                })
              }
            />
          )}
        </div>
      </div>
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
