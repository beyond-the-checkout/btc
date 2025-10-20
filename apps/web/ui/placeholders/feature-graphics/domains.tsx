import { QRCode, FlagWavy, LinkLogo } from "@dub/ui";
import { cn } from "@dub/utils";
import { CSSProperties } from "react";

const DOMAINS = [
  {
    domain: "chko.sh",
    scans: "15.6K",
    primary: true,
  },
  {
    domain: "chko.sh",
    scans: "3.7K",
  },
  {
    domain: "chko.sh",
    scans: "2.4K",
  },
];

export function Domains() {
  return (
    <div className="flex size-full flex-col justify-center" aria-hidden>
      <div className="flex flex-col gap-2.5 [mask-image:linear-gradient(90deg,black_70%,transparent)]">
        {DOMAINS.map(({ domain, scans, primary }, idx) => (
          <div
            key={domain}
            className="transition-transform duration-300 hover:translate-x-[-2%]"
          >
            <div
              className={cn(
                "flex cursor-default items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm",
                "ml-[calc((var(--idx)+1)*5%)]",
              )}
              style={{ "--idx": idx } as CSSProperties}
            >
              <div className="flex-none rounded-full border border-neutral-200 bg-gradient-to-t from-neutral-100 p-2">
                {/* NEW: Using Beyond The Checkout QR code logo */}
                <img
                  src="/logos/beyond-the-checkout-logo.png"
                  alt="Beyond The Checkout"
                  className="size-6 sm:size-6 object-contain"
                />
                {/* ORIGINAL LOGO (commented out) */}
                {/* <LinkLogo apexDomain="dub.co" className="size-6 sm:size-6" /> */}
              </div>

              <span className="text-base font-medium text-neutral-900">
                {domain}
              </span>

              <div className="ml-2 flex items-center gap-x-1 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-[0.2rem]">
                <QRCode className="h-4 w-4 text-neutral-700" />
                <div className="flex items-center whitespace-nowrap text-sm text-neutral-500">
                  {scans}
                  <span className="ml-1 hidden sm:inline-block">scans</span>
                </div>
              </div>

              {primary && (
                <div className="flex items-center gap-x-1 rounded-md border border-blue-100 bg-blue-50 px-2 py-[0.2rem]">
                  <FlagWavy className="h-4 w-4 text-blue-700" />
                  <div className="flex items-center whitespace-nowrap text-sm text-blue-600">
                    Primary
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
