"use client";

import dynamic from "next/dynamic";

export const QRCreatorClient = dynamic(
  () =>
    import("@/ui/modals/link-landing-qr-modal").then(
      (m) => m.LinkLandingQRCreator,
    ),
  { ssr: false },
);