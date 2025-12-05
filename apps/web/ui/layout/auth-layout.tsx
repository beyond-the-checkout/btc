import { ClientOnly } from "@dub/ui";
import { CHECKOUT_BASE_URL } from "@dub/utils";
import { PropsWithChildren, Suspense } from "react";

export const AuthLayout = ({
  showTerms,
  children,
}: PropsWithChildren<{ showTerms?: "app" | "partners" }>) => {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-between">
      {/* Empty div to help center main content */}
      <div className="grow basis-0">
        <div className="h-24" />
      </div>

      <ClientOnly className="relative flex w-full flex-col items-center justify-center px-4">
        <Suspense>{children}</Suspense>
      </ClientOnly>

      <div className="flex grow basis-0 flex-col justify-end">
        {showTerms && (
          <p className="px-20 py-8 text-center text-xs font-medium text-neutral-500 md:px-0">
            By continuing, you agree to Checkout&rsquo;s{" "}
            <a
              href={`${CHECKOUT_BASE_URL}/tos`}
              className="font-semibold text-neutral-600 hover:text-neutral-800"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href={`${CHECKOUT_BASE_URL}/privacy-policy`}
              className="font-semibold text-neutral-600 hover:text-neutral-800"
            >
              Privacy Policy
            </a>
          </p>
        )}
      </div>
    </div>
  );
};
