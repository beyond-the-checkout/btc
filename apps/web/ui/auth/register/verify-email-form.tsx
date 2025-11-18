"use client";

import { createUserAccountAction } from "@/lib/actions/create-user-account";
import { ensureDefaultWorkspace } from "@/lib/actions/ensure-default-workspace";
import { setOnboardingProgress } from "@/lib/actions/set-onboarding-progress";
import { logOnboardingError } from "@/lib/onboarding/logging";
import {
  QR_ONBOARDING_SOURCE_PARAM,
  QR_ONBOARDING_SOURCE_VALUE,
} from "@/lib/onboarding/qr";
import { AnimatedSizeContainer, Button, useMediaQuery } from "@dub/ui";
import { cn } from "@dub/utils";
import { OTPInput } from "input-otp";
import { signIn } from "next-auth/react";
import { useAction } from "next-safe-action/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useRegisterContext } from "./context";
import { ResendOtp } from "./resend-otp";

export const VerifyEmailForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile } = useMediaQuery();
  const [code, setCode] = useState("");
  const { email, password } = useRegisterContext();
  const [isInvalidCode, setIsInvalidCode] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { executeAsync: ensureWorkspace } = useAction(ensureDefaultWorkspace);
  const { executeAsync: setProgress } = useAction(setOnboardingProgress);

  const { executeAsync, isPending } = useAction(createUserAccountAction, {
    async onSuccess() {
      toast.success("Account created! Redirecting...");
      setIsRedirecting(true);

      const response = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (response?.ok) {
        const source = searchParams.get(QR_ONBOARDING_SOURCE_PARAM);
        const _next = searchParams.get("next");

        if (source === QR_ONBOARDING_SOURCE_VALUE) {
          try {
            const wsRes = await ensureWorkspace({});
            const ws = wsRes?.data;
            if (ws?.slug) {
              await setProgress({ onboardingStep: "plan" });
              router.push(
                `/onboarding/plan?workspace=${ws.slug}&${QR_ONBOARDING_SOURCE_PARAM}=${QR_ONBOARDING_SOURCE_VALUE}`,
              );
              return;
            }
          } catch (err) {
            logOnboardingError(
              "ensure-workspace-or-progress-failed",
              { source, email },
              err,
            );
            toast(
              "Continuing without QR setup. You can set this up later in Links.",
            );
            // Fall back to standard onboarding if workspace creation/progress fails
          }
        }

        router.push("/onboarding");
      } else {
        toast.error(
          "Failed to sign in with credentials. Please try again or contact support.",
        );
      }
    },
    onError({ error }) {
      toast.error(error.serverError);
      setCode("");
      setIsInvalidCode(true);
    },
  });

  if (!email || !password) {
    router.push("/register");
    return;
  }

  return (
    <div className="flex flex-col gap-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          executeAsync({ email, password, code });
        }}
      >
        <div>
          <OTPInput
            maxLength={6}
            value={code}
            onChange={(code) => {
              setIsInvalidCode(false);
              setCode(code);
            }}
            autoFocus={!isMobile}
            render={({ slots }) => (
              <div className="flex w-full items-center justify-between">
                {slots.map(({ char, isActive, hasFakeCaret }, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "relative flex h-14 w-12 items-center justify-center text-xl",
                      "rounded-lg border border-neutral-200 bg-white ring-0 transition-all",
                      isActive &&
                        "z-10 border border-neutral-800 ring-2 ring-neutral-200",
                      isInvalidCode && "border-red-500 ring-red-200",
                    )}
                  >
                    {char}
                    {hasFakeCaret && (
                      <div className="animate-caret-blink pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="h-5 w-px bg-black" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            onComplete={() => {
              executeAsync({ email, password, code });
            }}
          />
          <AnimatedSizeContainer height>
            {isInvalidCode && (
              <p className="pt-3 text-center text-xs font-medium text-red-500">
                Invalid code. Please try again.
              </p>
            )}
          </AnimatedSizeContainer>

          <Button
            className="mt-8"
            text={isPending ? "Verifying..." : "Continue"}
            type="submit"
            loading={isPending || isRedirecting}
            disabled={!code || code.length < 6}
          />
        </div>
      </form>

      <ResendOtp email={email} />
    </div>
  );
};
