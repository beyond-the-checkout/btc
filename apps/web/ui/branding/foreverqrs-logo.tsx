import { cn } from "@dub/utils";
import Image from "next/image";

type LogoVariant = "white" | "transparent";
type LogoSize = "sm" | "md" | "lg";

const LOGO_SOURCES: Record<LogoVariant, string> = {
  white: "https://assets.foreverqrs.com/assets/foreverqrs_logo_white.jpeg",
  transparent:
    "https://assets.foreverqrs.com/assets/foreverqrs_logo_transparent.webp",
};

const LOGO_SIZES: Record<LogoSize, number> = {
  sm: 24,
  md: 42,
  lg: 64,
};

export function ForeverQRsLogo({
  variant = "white",
  size = "md",
  priority = false,
  className,
}: {
  variant?: LogoVariant;
  size?: LogoSize;
  priority?: boolean;
  className?: string;
}) {
  const dimension = LOGO_SIZES[size];
  const src = LOGO_SOURCES[variant];

  return (
    <Image
      src={src}
      alt="ForeverQRs logo"
      width={dimension}
      height={dimension}
      sizes={`${dimension}px`}
      priority={priority}
      className={cn("object-contain", className)}
    />
  );
}
