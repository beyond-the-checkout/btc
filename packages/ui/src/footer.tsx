"use client";

import { cn, createHref } from "@dub/utils";
import Link from "next/link";
import { useParams } from "next/navigation";
import { LEGAL_PAGES } from "./content";
import { Github, LinkedIn, Twitter } from "./icons";
import { MaxWidthWrapper } from "./max-width-wrapper";
import { NavWordmark } from "./nav-wordmark";

const socials = [
  {
    name: "Twitter",
    icon: Twitter,
    href: "https://x.com/ForeverQRs",
  },
  {
    name: "LinkedIn",
    icon: LinkedIn,
    href: "https://www.linkedin.com/company/beyond-the-checkout-inc",
  },
  {
    name: "GitHub",
    icon: Github,
    href: "https://github.com/beyond-the-checkout",
  },
];

const navigation = {
  company: [
    { name: "About", href: "/" },
    { name: "Customers", href: "/customers" },
    { name: "Contact", href: "mailto:support@foreverqrs.com" },
  ],
  legal: LEGAL_PAGES.map(({ name, slug }) => ({
    name,
    href: `/${slug}`,
  })),
};

const linkListHeaderClassName = "text-sm font-medium text-neutral-900";
const linkListClassName = "flex flex-col mt-2.5 gap-3.5";
const linkListItemClassName =
  "flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors duration-75";

export function Footer({
  staticDomain,
  className,
}: {
  staticDomain?: string;
  className?: string;
}) {
  let { domain = "foreverqrs.com" } = useParams() as { domain: string };
  if (staticDomain) {
    domain = staticDomain;
  }

  return (
    <MaxWidthWrapper
      className={cn(
        "relative z-10 overflow-hidden border border-b-0 border-neutral-200 bg-white/50 py-16 backdrop-blur-lg md:rounded-t-2xl",
        className,
      )}
    >
      <footer>
        <div className="flex flex-col items-center gap-10">
          {/* Logo and socials */}
          <div className="flex flex-col items-center gap-6">
            <Link href={createHref("/", domain)} className="block max-w-fit">
              <span className="sr-only">
                {process.env.NEXT_PUBLIC_APP_NAME} Logo
              </span>
              <NavWordmark className="h-8 text-neutral-800" />
            </Link>
            <div className="flex items-center gap-3">
              {socials.map(({ name, icon: Icon, href }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-full p-1"
                >
                  <span className="sr-only">{name}</span>
                  <Icon className="size-4 text-neutral-900 transition-colors duration-75 group-hover:text-neutral-600" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation columns */}
          <div className="flex flex-wrap justify-center gap-16 sm:gap-24">
            <div className="text-center">
              <h3 className={linkListHeaderClassName}>Company</h3>
              <ul role="list" className={cn(linkListClassName, "items-center")}>
                {navigation.company.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={createHref(item.href, domain)}
                      className={linkListItemClassName}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-center">
              <h3 className={linkListHeaderClassName}>Legal</h3>
              <ul role="list" className={cn(linkListClassName, "items-center")}>
                {navigation.legal.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={createHref(item.href, domain)}
                      className={linkListItemClassName}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom row (copyright) */}
        <div className="mt-12">
          <p className="text-center text-xs text-neutral-500">
            © {new Date().getFullYear()} ForeverQRs a Beyond The Checkout
            Product
          </p>
        </div>
      </footer>
    </MaxWidthWrapper>
  );
}
