import { cn } from "@dub/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <img
      src="https://assets.chko.sh/assets/checkmark_black.png"
      alt="Checkout Logo"
      className={cn("h-10 w-10", className)}
    />
  );
}
