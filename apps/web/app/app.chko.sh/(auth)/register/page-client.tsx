"use client";

import { brandName } from "@/lib/branding";
import {
  RegisterProvider,
  useRegisterContext,
} from "@/ui/auth/register/context";
import { SignUpForm } from "@/ui/auth/register/signup-form";
import { VerifyEmailForm } from "@/ui/auth/register/verify-email-form";
import { truncate } from "@dub/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

/**
 * Build an auth link preserving the `next` and `source` query params.
 * This ensures users can navigate between register and login
 * while maintaining the return destination.
 */
function buildAuthLink(
  path: "/login" | "/register",
  searchParams: URLSearchParams,
): string {
  const params = new URLSearchParams();
  const next = searchParams.get("next");
  const source = searchParams.get("source");

  if (next) params.set("next", next);
  if (source) params.set("source", source);

  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export default function RegisterPageClient() {
  return (
    <RegisterProvider>
      <RegisterFlow />
    </RegisterProvider>
  );
}

function SignUp() {
  const searchParams = useSearchParams();

  return (
    <>
      <div className="w-full max-w-sm">
        <h3 className="text-center text-xl font-semibold">
          Create your {brandName()} account
        </h3>
        <div className="mt-8">
          <SignUpForm />
        </div>
        <p className="mt-6 text-center text-sm font-medium text-neutral-500">
          Already have an account?&nbsp;
          <Link
            href={buildAuthLink("/login", searchParams)}
            className="font-semibold text-neutral-700 transition-colors hover:text-neutral-900"
          >
            Log in
          </Link>
        </p>
      </div>
    </>
  );
}

function Verify() {
  const { email } = useRegisterContext();

  return (
    <>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-center text-xl font-semibold">
            Verify your email address
          </h3>
          <p className="text-base font-medium text-neutral-500">
            Enter the six digit verification code sent to{" "}
            <strong className="font-semibold text-neutral-600" title={email}>
              {truncate(email, 30)}
            </strong>
          </p>
        </div>
        <div className="mt-12">
          <VerifyEmailForm />
        </div>
      </div>
    </>
  );
}

const RegisterFlow = () => {
  const { step } = useRegisterContext();

  if (step === "signup") return <SignUp />;
  if (step === "verify") return <Verify />;
};
