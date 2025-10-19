import { cn, createHref } from "@dub/utils";
import { Link as NavigationMenuLink } from "@radix-ui/react-navigation-menu";
import Link from "next/link";
import { CSSProperties } from "react";
import { Grid } from "../..";
import { DubAnalyticsIcon, DubLinksIcon, DubPartnersIcon } from "../../icons";
import { AnalyticsGraphic } from "./graphics/analytics-graphic";
import { LinksGraphic } from "./graphics/links-graphic";
import { PartnersGraphic } from "./graphics/partners-graphic";
import { getUtmParams } from "./shared";

const products = [
  {
    icon: (
      <div className="flex size-4 items-center justify-center rounded bg-orange-400">
        <DubLinksIcon className="size-2.5 text-orange-900" />
      </div>
    ),
    title: "Static QR codes",
    description: "Simple, permanent QR codes for packaging.",
    href: "/qr-codes/static",
    color: "#f4950c",
    graphicsContainerClassName: "px-2",
    graphic: <LinksGraphic className="absolute left-0 top-0 h-auto w-full" />,
  },
  {
    icon: (
      <div className="flex size-4 items-center justify-center rounded bg-green-400">
        <DubAnalyticsIcon className="size-2.5 text-green-900" />
      </div>
    ),
    title: "Dynamic QR codes",
    description: "Updateable QR codes with tracking and analytics.",
    href: "/qr-codes/dynamic",
    color: "#36D78F",
    graphicsContainerClassName: "h-[170%] bottom-0 top-[unset]",
    graphic: (
      <AnalyticsGraphic className="absolute bottom-0 left-0 size-full" />
    ),
  },
  {
    icon: (
      <div className="flex size-4 items-center justify-center rounded bg-violet-400">
        <DubPartnersIcon className="size-2.5 text-violet-900" />
      </div>
    ),
    title: "Incentive QR codes",
    description: "Reward customers with Bitcoin via Lightning Network.",
    href: "/qr-codes/incentive",
    color: "#818cf8",
    graphicsContainerClassName: "pl-2",
    graphic: <PartnersGraphic />,
  },
];

export function ProductContent({ domain }: { domain: string }) {
  return (
    <div className="grid w-[1020px] grid-cols-1 gap-4 p-4">
      <div className="grid grid-cols-3 gap-4">
        {products.map(
          ({
            title,
            description,
            icon,
            href,
            color,
            graphicsContainerClassName,
            graphic,
          }) => (
            <NavigationMenuLink asChild key={title}>
              <Link
                href={createHref(
                  href,
                  domain,
                  getUtmParams({ domain, utm_content: title }),
                )}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50 dark:border-white/20 dark:bg-white/10"
              >
                <Grid
                  className="[mask-image:linear-gradient(transparent,black,transparent)] dark:text-white/5"
                  cellSize={60}
                  patternOffset={[-51, -23]}
                />
                <div className="relative p-5 pb-0">
                  {icon}
                  <span className="mt-3 block text-sm font-medium text-neutral-900 dark:text-white">
                    {title}
                  </span>
                  <p className="mt-2 max-w-56 text-sm text-neutral-500 dark:text-white/60">
                    {description}
                  </p>
                </div>
                <div className="relative mt-10 h-40 grow">
                  <div
                    className={cn(
                      "absolute left-0 top-0 size-full grow overflow-hidden [mask-image:linear-gradient(black_50%,transparent)]",
                      graphicsContainerClassName,
                    )}
                  >
                    <div className="relative size-full">{graphic}</div>
                  </div>
                </div>
                <div
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,var(--color),transparent)] opacity-[0.07] transition-opacity duration-150 group-hover:opacity-15"
                  style={
                    {
                      "--color": color,
                    } as CSSProperties
                  }
                />
              </Link>
            </NavigationMenuLink>
          ),
        )}
      </div>
    </div>
  );
}
