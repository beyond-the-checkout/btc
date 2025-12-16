import { trackConversion } from "@/lib/tracking-pixels";
import { Button, Modal, useRouterStuff } from "@dub/ui";
import { getPlanDetails, PLANS, PRO_PLAN } from "@dub/utils";
import { usePlausible } from "next-plausible";
import { useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ModalHero } from "../shared/modal-hero";

function UpgradedModal({
  showUpgradedModal,
  setShowUpgradedModal,
}: {
  showUpgradedModal: boolean;
  setShowUpgradedModal: Dispatch<SetStateAction<boolean>>;
}) {
  const { queryParams } = useRouterStuff();
  const searchParams = useSearchParams();

  const planId = searchParams.get("plan");
  const plausible = usePlausible();

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

  const plan = planId
    ? PLANS.find(
        (p) => p.name.toLowerCase() === planId.replace("+", " ").toLowerCase(),
      ) ?? PRO_PLAN
    : undefined;

  if (!plan) return null;

  const onClose = () => {
    queryParams({
      del: ["upgraded", "plan", "period"],
    });
  };

  return (
    <Modal
      showModal={showUpgradedModal}
      setShowModal={setShowUpgradedModal}
      onClose={onClose}
    >
      <div className="flex flex-col">
        <ModalHero />
        <div className="px-6 py-8 sm:px-8">
          <div className="text-left">
            <h1 className="text-lg font-semibold text-neutral-900">
              Checkout {plan?.name} looks good on you!
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              Thank you for upgrading to the {plan?.name} plan. You now have
              access to more powerful features and higher usage limits.
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            text="Go to dashboard"
            className="mt-6"
            onClick={() => {
              onClose();
              setShowUpgradedModal(false);
            }}
          />
        </div>
      </div>
    </Modal>
  );
}

export function useUpgradedModal() {
  const [showUpgradedModal, setShowUpgradedModal] = useState(false);

  const UpgradedModalCallback = useCallback(() => {
    return (
      <UpgradedModal
        showUpgradedModal={showUpgradedModal}
        setShowUpgradedModal={setShowUpgradedModal}
      />
    );
  }, [showUpgradedModal, setShowUpgradedModal]);

  return useMemo(
    () => ({
      setShowUpgradedModal,
      UpgradedModal: UpgradedModalCallback,
    }),
    [setShowUpgradedModal, UpgradedModalCallback],
  );
}
