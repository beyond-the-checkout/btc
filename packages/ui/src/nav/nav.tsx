"use client";

import { APP_DOMAIN, cn, createHref, fetcher } from "@dub/utils";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { LayoutGroup } from "motion/react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { createContext, useId } from "react";
import useSWR from "swr";
import { buttonVariants } from "../button";
import { useScroll } from "../hooks";
import { MaxWidthWrapper } from "../max-width-wrapper";
import { NavWordmark } from "../nav-wordmark";

export type NavTheme = "light" | "dark";

export const NavContext = createContext<{ theme: NavTheme }>({
  theme: "light",
});

export const navItems = [
  {
    name: "Customers",
    href: "/customers",
    segments: ["/customers"],
  },
  {
    name: "Pricing",
    href: "/pricing",
    segments: ["/pricing"],
  },
];

const navItemClassName = cn(
  "relative group/item flex items-center rounded-md px-4 py-2 text-sm rounded-lg font-medium text-neutral-700 hover:text-neutral-900 transition-colors",
  "dark:text-white/90 dark:hover:text-white",
  "hover:bg-neutral-900/5 dark:hover:bg-white/10",
  "data-[active=true]:bg-neutral-900/5 dark:data-[active=true]:bg-white/10",

  // Hide active state when another item is hovered
  "group-has-[:hover]:data-[active=true]:[&:not(:hover)]:bg-transparent",
);

export function Nav({
  theme = "light",
  staticDomain,
  maxWidthWrapperClassName,
}: {
  theme?: NavTheme;
  staticDomain?: string;
  maxWidthWrapperClassName?: string;
}) {
  let { domain } = useParams() as { domain: string };

  if (staticDomain) {
    domain = staticDomain;
  } else if (!domain) {
    // Use environment variable or throw error
    const defaultDomain = process.env.NEXT_PUBLIC_DEFAULT_DOMAIN;
    if (!defaultDomain) {
      throw new Error(
        "NEXT_PUBLIC_DEFAULT_DOMAIN environment variable is required when no domain parameter is present",
      );
    }
    domain = defaultDomain;
  }

  const layoutGroupId = useId();

  const scrolled = useScroll(40);
  const pathname = usePathname();
  const { data: session, isLoading } = useSWR(
    (domain.endsWith("chko.sh") || domain.endsWith("chko.dev")) &&
      "/api/auth/session",
    fetcher,
    {
      dedupingInterval: 60000,
    },
  );

  return (
    <NavContext.Provider value={{ theme }}>
      <LayoutGroup id={layoutGroupId}>
        <div
          className={cn(
            `sticky inset-x-0 top-0 z-30 w-full transition-all`,
            theme === "dark" && "dark",
          )}
        >
          {/* Scrolled background */}
          <div
            className={cn(
              "absolute inset-0 block border-b border-transparent transition-all",
              scrolled &&
                "border-neutral-100 bg-white/75 backdrop-blur-lg dark:border-white/10 dark:bg-black/75",
            )}
          />
          <MaxWidthWrapper className={cn("relative", maxWidthWrapperClassName)}>
            <div className="flex h-14 items-center justify-between">
              <div className="grow basis-0">
                <Link
                  className="block w-fit py-2 pr-2"
                  href={createHref("/home", domain, {
                    utm_source: "Custom Domain",
                    utm_medium: "Navbar",
                    utm_campaign: domain,
                    utm_content: "Logo",
                  })}
                >
                  <NavWordmark />
                </Link>
              </div>
              <NavigationMenuPrimitive.Root
                delayDuration={0}
                className="relative hidden lg:block"
              >
                <NavigationMenuPrimitive.List className="group relative z-0 flex">
                  {navItems.map(({ name, href, segments }) => {
                    const isActive = segments.some((segment) =>
                      pathname?.startsWith(segment),
                    );
                    return (
                      <NavigationMenuPrimitive.Item key={name}>
                        <Link
                          id={`nav-${href}`}
                          href={createHref(href, domain, {
                            utm_source: "Custom Domain",
                            utm_medium: "Navbar",
                            utm_campaign: domain,
                            utm_content: name,
                          })}
                          className={navItemClassName}
                          data-active={isActive}
                        >
                          {name}
                        </Link>
                      </NavigationMenuPrimitive.Item>
                    );
                  })}
                </NavigationMenuPrimitive.List>
              </NavigationMenuPrimitive.Root>

              <div className="hidden grow basis-0 justify-end gap-2 lg:flex">
                {session && Object.keys(session).length > 0 ? (
                  <Link
                    href={APP_DOMAIN}
                    className={cn(
                      buttonVariants({ variant: "primary" }),
                      "flex h-8 items-center rounded-lg border px-4 text-sm",
                      "dark:border-white dark:bg-white dark:text-black dark:hover:bg-neutral-50 dark:hover:ring-white/10",
                    )}
                  >
                    Dashboard
                  </Link>
                ) : !isLoading ? (
                  <>
                    <Link
                      href={`${APP_DOMAIN}/login`}
                      className={cn(
                        buttonVariants({ variant: "secondary" }),
                        "flex h-8 items-center rounded-lg border px-4 text-sm",
                        "dark:border-white/10 dark:bg-black dark:text-white dark:hover:bg-neutral-900",
                      )}
                    >
                      Log in
                    </Link>
                    <Link
                      href={`${APP_DOMAIN}/register`}
                      className={cn(
                        buttonVariants({ variant: "primary" }),
                        "flex h-8 items-center rounded-lg border px-4 text-sm",
                        "dark:border-white dark:bg-white dark:text-black dark:hover:bg-neutral-50 dark:hover:ring-white/10",
                      )}
                    >
                      Sign up
                    </Link>
                  </>
                ) : null}
              </div>
            </div>
          </MaxWidthWrapper>
        </div>
      </LayoutGroup>
    </NavContext.Provider>
  );
}
