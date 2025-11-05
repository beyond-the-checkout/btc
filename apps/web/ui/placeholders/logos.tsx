import { ExpandingArrow } from "@dub/ui";
import { cn, createHref, UTMTags } from "@dub/utils";
import Link from "next/link";

const logos = [
  {
    name: "fmk",
    url: "https://assets.chko.sh/partners/FMK_Logo.webp",
    href: "https://www.freemarketkids.com/",
  },
  {
    name: "foundation",
    url: "https://assets.chko.sh/partners/foundation_brand.png",
    href: "https://foundation.xyz/",
  },
  {
    name: "btc-tc",
    url: "https://assets.chko.sh/partners/BTC-TC_Gold-Black.jpg",
    href: "https://btc-tc.com/",
  },
  {
    name: "shamory",
    url: "https://assets.chko.sh/partners/ShamoryLogo.jpg",
    href: "https://shamory.com/",
  },
  {
    name: "panties4bitcoin",
    url: "https://assets.chko.sh/partners/P4B_RoundLogo.png",
    href: "https://www.pantiesforbitcoin.com/",
  },
  {
    name: "nihowdy",
    url: "https://assets.chko.sh/partners/241120_NiHowdy_Logo.png",
    href: "https://nihowdy.com/",
  },
  {
    name: "proofofpod",
    url: "https://assets.chko.sh/partners/ProofOfPod_Logo.png",
    href: "https://www.youtube.com/@ProofofPod",
  },
  {
    name: "jippi",
    url: "https://assets.chko.sh/partners/Jippi_Logo.png",
    href: "https://jippi.app/",
  },
];

export default function Logos({
  domain,
  utmParams,
  variant = "default",
  copy = "Trusted by our partners",
  className,
}: {
  domain: string;
  utmParams?: Partial<Record<(typeof UTMTags)[number], string>>;
  variant?: "default" | "inline";
  copy?: string | null;
  className?: string;
}) {
  return (
    <Link
      href={createHref("/customers", domain, {
        utm_campaign: domain,
        utm_content: "See more of our fantastic customers",
        ...utmParams,
      })}
      className={cn(
        "group relative mx-auto mb-2 mt-10 block w-full max-w-screen-lg overflow-hidden [&_*]:delay-75",
        variant === "inline" && "sm:flex sm:items-center",
        className,
      )}
    >
      {copy !== null && (
        <p
          className={cn(
            "mx-auto max-w-sm text-balance text-center text-sm text-content-subtle",
            variant === "default"
              ? "transition-[filter,opacity] duration-300 group-hover:opacity-30 group-hover:blur-sm sm:max-w-xl"
              : "sm:text-left",
          )}
        >
          {copy}
        </p>
      )}
      <div className="relative flex w-full items-center overflow-hidden px-5 pb-8 pt-8 [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)] md:px-0">
        {[...Array(2)].map((_, idx) => (
          <div
            key={idx}
            className={cn(
              "flex w-max min-w-max items-center gap-5 pl-5",
              "motion-safe:animate-infinite-scroll [--scroll:-100%] motion-safe:[animation-duration:40s]",
              "transition-[filter,opacity] duration-300 group-hover:opacity-30 group-hover:blur-sm",
            )}
            aria-hidden={idx !== 0}
          >
            {logos.map((logo) => (
              <img
                key={logo.name}
                src={logo.url}
                alt={logo.name.toUpperCase()}
                width={180}
                height={180}
                draggable={false}
                className="size-12 object-contain"
              />
            ))}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="flex items-center text-sm font-medium text-content-emphasis">
          See more of our partners{" "}
          <ExpandingArrow className="size-4" />
        </span>
      </div>
    </Link>
  );
}
