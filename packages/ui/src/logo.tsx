import Image from "next/image";
import { cn } from "@dub/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="https://assets.chko.sh/assets/checkmark_black.png"
      alt="Checkout Logo"
      width={40}
      height={40}
      className={cn("h-10 w-10", className)}
      unoptimized
      priority
    />
  );
}
