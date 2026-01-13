"use client";

import dynamic from "next/dynamic";

function QRCreatorSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4">
      <div className="flex flex-col gap-5">
        <div className="mx-auto w-full lg:w-[448px]">
          <div className="h-14 w-full animate-pulse rounded-xl bg-neutral-200" />
        </div>
        <div className="flex justify-center">
          <div className="flex w-full flex-col gap-4 lg:flex-row">
            <div className="relative w-full flex-shrink-0 max-lg:max-w-md lg:w-[448px]">
              <div className="h-[620px] w-full animate-pulse rounded-2xl border border-neutral-200 bg-neutral-100" />
            </div>
          </div>
        </div>
        <div className="mx-auto w-full lg:w-[448px]">
          <div className="h-12 w-full animate-pulse rounded-xl bg-neutral-200" />
        </div>
      </div>
    </div>
  );
}

export const QRCreatorClient = dynamic(
  () =>
    import("@/ui/modals/link-landing-qr-modal").then(
      (m) => m.LinkLandingQRCreator,
    ),
  {
    ssr: false,
    loading: () => <QRCreatorSkeleton />,
  },
);
