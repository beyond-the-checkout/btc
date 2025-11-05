import { ElementType } from "react";
import {
  Book2Fill,
  BriefcaseFill,
  BulletListFill,
  DiamondTurnRightFill,
  DubAnalyticsIcon,
  DubLinksIcon,
  DubPartnersIcon,
  EnvelopeFill,
  FeatherFill,
  Github,
  Go,
  LifeRingFill,
  LinkedIn,
  MicrophoneFill,
  Php,
  Python,
  Ruby,
  Toggle2Fill,
  Twitter,
  Typescript,
  UsersFill,
  YouTube,
} from "./icons";
import { DubApiIcon } from "./icons/dub-api";
import { Logo } from "./logo";

export type NavItemChild = {
  title: string;
  description?: string;
  href: string;
  icon: ElementType;
  iconClassName?: string;
};

export type NavItemChildren = (
  | NavItemChild
  | { label: string; items: NavItemChild[] }
)[];

export const FEATURES_LIST = [
  {
    id: "links",
    title: "Static QR codes",
    description: "Simple, permanent QR codes for packaging",
    icon: DubLinksIcon,
    href: "/qr-codes/static",
  },
  {
    id: "analytics",
    title: "Dynamic QR codes",
    description: "Updateable QR codes with tracking and analytics",
    icon: DubAnalyticsIcon,
    href: "/qr-codes/dynamic",
  },
  {
    id: "partners",
    title: "Incentive QR codes",
    description: "Reward customers with Bitcoin via Lightning Network",
    icon: DubPartnersIcon,
    href: "/qr-codes/incentive",
  },
];

export const SDKS = [
  {
    icon: Typescript,
    iconClassName: "py-0.5 group-hover:text-[#3178C6]",
    title: "Typescript",
    href: "/sdks/typescript",
  },
  {
    icon: Python,
    iconClassName:
      "py-0.5 [&_.snake]:transition-colors group-hover:[&_.snake1]:text-[#3776ab] group-hover:[&_.snake2]:text-[#ffd343]",
    title: "Python",
    href: "/sdks/python",
  },
  {
    icon: Go,
    iconClassName: "group-hover:text-[#00ACD7]",
    title: "Go",
    href: "/sdks/go",
  },
  {
    icon: Ruby,
    iconClassName:
      "py-[3px] grayscale brightness-150 transition-[filter] group-hover:grayscale-0 group-hover:brightness-100",
    title: "Ruby",
    href: "/sdks/ruby",
  },
  {
    icon: Php,
    iconClassName:
      "py-[3px] grayscale brightness-150 transition-[filter] group-hover:grayscale-0 group-hover:brightness-100",
    title: "PHP",
    href: "/sdks/php",
  },
];

export const SOLUTIONS: NavItemChildren = [
  {
    icon: DiamondTurnRightFill,
    title: "Marketing Attribution",
    description: "Easily track and measure marketing impact",
    href: "/analytics",
  },
  {
    icon: MicrophoneFill,
    title: "Content Creators",
    description: "Intelligent audience insights and link tracking",
    href: "/solutions/creators",
  },
  {
    label: "SDKs",
    items: SDKS,
  },
];

export const RESOURCES = [
  {
    icon: LifeRingFill,
    title: "Help Center",
    description: "Answers to your questions",
    href: "/help",
  },
  {
    icon: Book2Fill,
    title: "Docs",
    description: "Platform documentation",
    href: "/docs/introduction",
  },
  {
    icon: UsersFill,
    title: "About",
    description: "Company, values, and team",
    href: "/about",
  },
  {
    icon: BriefcaseFill,
    title: "Careers",
    description: "Join our global, remote team",
    href: "/careers",
  },
  {
    icon: FeatherFill,
    title: "Blog",
    description: "Insights and stories",
    href: "/blog",
  },
  {
    icon: BulletListFill,
    title: "Changelog",
    description: "Releases and updates",
    href: "/changelog",
  },
  {
    icon: Logo,
    title: "Brand Guidelines",
    description: "Logos, wordmark, etc.",
    href: "/brand",
  },
  {
    icon: EnvelopeFill,
    title: "Contact",
    description: "Reach out to support or sales",
    href: "/contact",
  },
];

export const COMPARE_PAGES = [
  { name: "Flow Code", slug: "flowcode" },
  { name: "QR Tiger", slug: "qr-tiger" },
  { name: "QRStuff", slug: "qrstuff" },
];

export const LEGAL_PAGES = [
  { name: "Terms of Service", slug: "tos" },
  { name: "Privacy Policy", slug: "privacy-policy" },
];

export const SOCIAL_LINKS = [
  { name: "X (Twitter)", icon: Twitter, href: "https://x.com/BTCheckoutTech" },
  {
    name: "LinkedIn",
    icon: LinkedIn,
    href: "https://www.linkedin.com/company/beyond-the-checkout",
  },
  {
    name: "GitHub",
    icon: Github,
    href: "https://github.com/beyond-the-checkout",
  },
];
