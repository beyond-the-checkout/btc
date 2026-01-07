import { CHECKOUT_LOGO_SQUARE, cn } from "@dub/utils";
import Image from "next/image";

export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src={CHECKOUT_LOGO_SQUARE}
      alt="ForeverQRs Logo"
      width={40}
      height={40}
      className={cn("h-10 w-10", className)}
      unoptimized
      priority
    />
  );
}
