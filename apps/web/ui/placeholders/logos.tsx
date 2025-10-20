import { ExpandingArrow } from "@dub/ui";
import { cn, createHref, UTMTags } from "@dub/utils";
import Link from "next/link";

// TODO: Move these logo images from the checkout.tech CDN to a dedicated assets CDN
// Currently loading from: https://checkout.tech/_next/image/...
// Should move to: https://assets.checkout.tech/partners/ or similar
const logos = [
  {
    name: "fmk",
    url: "https://checkout.tech/_next/image?url=%2Fimages%2FFMK%2FFMK_Logo.webp&w=384&q=75",
    href: "https://www.freemarketkids.com/",
  },
  {
    name: "foundation",
    url: "https://checkout.tech/_next/image?url=%2Fimages%2FPartners%2Ffoundation_brand.png&w=384&q=75",
    href: "https://foundation.xyz/",
  },
  {
    name: "btc-tc",
    url: "https://checkout.tech/_next/image?url=%2Fimages%2FBTC-TC%2FBTC-TC_Gold-Black.jpg&w=384&q=75",
    href: "https://btc-tc.com/",
  },
  {
    name: "shamory",
    url: "https://checkout.tech/_next/image?url=%2Fimages%2FShamory%2FShamoryLogo.jpg&w=384&q=75",
    href: "https://shamory.com/",
  },
  {
    name: "panties4bitcoin",
    url: "https://checkout.tech/_next/image?url=%2Fimages%2FPartners%2FP4B_RoundLogo.png&w=384&q=75",
    href: "https://www.pantiesforbitcoin.com/",
  },
  {
    name: "nihowdy",
    url: "https://checkout.tech/_next/image?url=%2Fimages%2FPartners%2F241120_NiHowdy_Logo.png&w=384&q=75",
    href: "https://nihowdy.com/",
  },
  {
    name: "proofofpod",
    url: "https://checkout.tech/_next/image?url=%2Fimages%2FPartners%2FProofOfPod_Logo.png&w=384&q=75",
    href: "https://www.youtube.com/@ProofofPod",
  },
  {
    name: "jippi",
    url: "https://checkout.tech/_next/image?url=%2Fimages%2FPartners%2FJippi_Logo.png&w=384&q=75",
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
