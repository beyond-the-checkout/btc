"use client";

/**
 * Sidebar navigation for the in-app experience.
 *
 * This component coordinates plan-based gating (see `@/lib/plan-capabilities`)
 * with deployment feature flags defined in `@/lib/feature-flags`. Deployment
 * flags remove entire product areas at build time, while plan capabilities gate
 * workspace-level entitlements. Keep both systems in mind when adding new nav
 * entries so that features can be hidden globally or per workspace.
 */
import { getPlanCapabilities } from "@/lib/plan-capabilities";
import { isFeatureEnabled } from "@/lib/feature-flags";
import {
  SubmissionsCountByStatus,
  useBountySubmissionsCount,
} from "@/lib/swr/use-bounty-submissions-count";
import useCustomersCount from "@/lib/swr/use-customers-count";
import { usePartnerMessagesCount } from "@/lib/swr/use-partner-messages-count";
import usePayoutsCount from "@/lib/swr/use-payouts-count";
import useProgram from "@/lib/swr/use-program";
import useWorkspace from "@/lib/swr/use-workspace";
import { useRouterStuff } from "@dub/ui";
import {
  Bell,
  Brush,
  ConnectedDots,
  CubeSettings,
  DiamondTurnRight,
  Discount,
  Folder,
  Gauge6,
  Gear2,
  Gift,
  Globe,
  InvoiceDollar,
  Key,
  LifeRing,
  LinesY as LinesYStatic,
  MoneyBills2,
  Msgs,
  Receipt2,
  ShieldCheck,
  Sliders,
  Tag,
  UserCheck,
  UserPlus,
  Users,
  Users6,
  Webhook,
} from "@dub/ui/icons";
import { Trophy } from "lucide-react";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useParams, usePathname } from "next/navigation";
import { ReactNode, useMemo } from "react";
import { DubPartnersPopup } from "./dub-partners-popup";
import { Compass } from "./icons/compass";
import { ConnectedDots4 } from "./icons/connected-dots4";
import { CursorRays } from "./icons/cursor-rays";
import { Hyperlink } from "./icons/hyperlink";
import { LinesY } from "./icons/lines-y";
import { User } from "./icons/user";
import {
  NavGroupType,
  SidebarNav,
  SidebarNavAreas,
  SidebarNavGroups,
} from "./sidebar-nav";
import { SidebarUsage } from "./sidebar-usage";
import { useProgramApplicationsCount } from "./use-program-applications-count";
import { WorkspaceDropdown } from "./workspace-dropdown";

type SidebarNavData = {
  slug: string;
  pathname: string;
  queryString: string;
  defaultProgramId?: string;
  session?: Session | null;
  showNews?: boolean;
  pendingPayoutsCount?: number;
  applicationsCount?: number;
  submittedBountiesCount?: number;
  unreadMessagesCount?: number;
  showConversionGuides?: boolean;
  partnerNetworkEnabled?: boolean;
};

const FIVE_YEARS_SECONDS = 60 * 60 * 24 * 365 * 5;

const NAV_GROUPS: SidebarNavGroups<SidebarNavData> = ({
  slug,
  pathname,
  defaultProgramId,
}) =>
  [
    // Deployment flag: hide the entire Short Links group when disabled so the
    // product area disappears from navigation in lockstep with route guards.
    isFeatureEnabled("links")
      ? {
          name: "QR Codes",
          description:
            "Create, organize, and measure the performance of your QR codes.",
          learnMoreHref: "https://dub.co/links",
          icon: Compass,
          href: slug ? `/${slug}/links` : "/links",
          active:
            !!slug &&
            pathname.startsWith(`/${slug}`) &&
            !pathname.startsWith(`/${slug}/program`) &&
            !pathname.startsWith(`/${slug}/settings`),

          onClick: () => {
            document.cookie = `dub_product:${slug}=links;path=/;max-age=${FIVE_YEARS_SECONDS}`;
          },
        }
      : null,
    // Deployment flag: hide Partner Program entry globally when feature is off.
    isFeatureEnabled("partnerProgram")
      ? {
          name: "Partner Program",
          description:
            "Kickstart viral product-led growth with powerful, branded referral and affiliate programs.",
          learnMoreHref: "https://dub.co/partners",
          icon: ConnectedDots4,
          href: slug ? `/${slug}/program` : "/program",
          active: pathname.startsWith(`/${slug}/program`),
          popup: DubPartnersPopup,

          onClick: defaultProgramId
            ? () => {
                document.cookie = `dub_product:${slug}=program;path=/;max-age=${FIVE_YEARS_SECONDS}`;
              }
            : undefined,
        }
      : null,
  ].filter(Boolean) as unknown as NavGroupType[];

const NAV_AREAS: SidebarNavAreas<SidebarNavData> = {
  // Top-level
  default: ({ slug, pathname, queryString, showNews }) => {
    if (!isFeatureEnabled("links")) {
      // Deployment flag disabled: render an empty shell so the sidebar closes.
      return {
        title: "",
        showNews: false,
        direction: "left",
        content: [],
      };
    }

    return {
      title: "",
      showNews,
      direction: "left",
      content: [
        {
          name: "QR Codes",
          items: [
            {
              name: "Codes",
              icon: Hyperlink,
              href: `/${slug}/links${pathname === `/${slug}/links` ? "" : queryString}`,
              isActive: (pathname: string, href: string) => {
                const basePath = href.split("?")[0];

                // Exact match for the base links page
                if (pathname === basePath) return true;

                // Check if it's a link detail page (path segment after base contains a dot for domain)
                if (pathname.startsWith(basePath + "/")) {
                  const nextSegment = pathname
                    .slice(basePath.length + 1)
                    .split("/")[0];
                  return nextSegment.includes(".");
                }

                return false;
              },
            },
          ],
        },
        {
          name: "Insights",
          items: [
            {
              name: "Analytics",
              icon: LinesY,
              href: `/${slug}/analytics${pathname === `/${slug}/analytics` ? "" : queryString}`,
            },
            {
              name: "Events",
              icon: CursorRays,
              href: `/${slug}/events${pathname === `/${slug}/events` ? "" : queryString}`,
            },
            {
              name: "Customers",
              icon: User,
              href: `/${slug}/customers`,
            },
          ],
        },
        {
          name: "Library",
          items: [
            {
              name: "Folders",
              icon: Folder,
              href: `/${slug}/links/folders`,
            },
            {
              name: "Tags",
              icon: Tag,
              href: `/${slug}/links/tags`,
            },
            {
              name: "UTM Templates",
              icon: DiamondTurnRight,
              href: `/${slug}/links/utm`,
            },
          ],
        },
      ],
    };
  },

  // Program
  program: ({
    slug,
    showNews,
    pendingPayoutsCount,
    applicationsCount,
    submittedBountiesCount,
    unreadMessagesCount,
    partnerNetworkEnabled,
  }) => {
    if (!isFeatureEnabled("partnerProgram")) {
      // Partner Program disabled: return an empty section so nav collapses.
      return {
        title: "Partner Program",
        showNews: false,
        direction: "left",
        content: [],
      };
    }

    return {
      title: "Partner Program",
      showNews,
      direction: "left",
      content: [
        {
          items: [
            {
              name: "Overview",
              icon: Gauge6,
              href: `/${slug}/program`,
              exact: true,
            },
            {
              name: "Payouts",
              icon: MoneyBills2,
              href: `/${slug}/program/payouts?status=pending&sortBy=amount`,
              badge: pendingPayoutsCount
                ? pendingPayoutsCount > 99
                  ? "99+"
                  : pendingPayoutsCount
                : undefined,
            },
            {
              name: "Messages",
              icon: Msgs,
              href: `/${slug}/program/messages`,
              badge: unreadMessagesCount
                ? unreadMessagesCount > 99
                  ? "99+"
                  : unreadMessagesCount
                : "New",
            },
          ],
        },
        {
          name: "Partners",
          items: [
            {
              name: "All Partners",
              icon: Users,
              href: `/${slug}/program/partners`,
              isActive: (pathname: string, href: string) =>
                pathname.startsWith(href) &&
                !pathname.startsWith(`${href}/applications`),
            },
            {
              name: "Groups",
              icon: Users6,
              href: `/${slug}/program/groups`,
            },
            ...(partnerNetworkEnabled
              ? [
                  {
                    name: "Partner Network",
                    icon: UserPlus,
                    href: `/${slug}/program/network` as `/${string}`,
                  },
                ]
              : []),
            {
              name: "Applications",
              icon: UserCheck,
              href: `/${slug}/program/partners/applications`,
              badge: applicationsCount
                ? applicationsCount > 99
                  ? "99+"
                  : applicationsCount
                : undefined,
            },
          ],
        },
        {
          name: "Insights",
          items: [
            {
              name: "Analytics",
              icon: LinesYStatic,
              href: `/${slug}/program/analytics`,
            },
            {
              name: "Commissions",
              icon: InvoiceDollar,
              href: `/${slug}/program/commissions`,
            },
            // {
            //   name: "Fraud & Risk",
            //   icon: ShieldKeyhole,
            //   href: `/${slug}/program/fraud`,
            // },
          ],
        },
        {
          name: "Engagement",
          items: [
            {
              name: "Bounties",
              icon: Trophy,
              href: `/${slug}/program/bounties`,
              badge: submittedBountiesCount
                ? submittedBountiesCount > 99
                  ? "99+"
                  : submittedBountiesCount
                : "New",
            },
            {
              name: "Resources",
              icon: LifeRing,
              href: `/${slug}/program/resources`,
            },
          ],
        },
        {
          name: "Configuration",
          items: [
            {
              name: "Rewards",
              icon: Gift,
              href: `/${slug}/program/groups/default/rewards`,
              arrow: true,
              isActive: () => false,
            },
            {
              name: "Discounts",
              icon: Discount,
              href: `/${slug}/program/groups/default/discounts`,
              arrow: true,
              isActive: () => false,
            },
            {
              name: "Links",
              icon: Sliders,
              href: `/${slug}/program/groups/default/links`,
              arrow: true,
              isActive: () => false,
            },
            {
              name: "Branding",
              icon: Brush,
              arrow: true,
              href: `/${slug}/program/groups/default/branding`,
              isActive: () => false,
            },
          ],
        },
      ],
    };
  },

  // Workspace settings
  workspaceSettings: ({ slug }) => ({
    title: "Settings",
    backHref: `/${slug}`,
    content: [
      {
        name: "Workspace",
        items: [
          {
            name: "General",
            icon: Gear2,
            href: `/${slug}/settings`,
            exact: true,
          },
          {
            name: "Billing",
            icon: Receipt2,
            href: `/${slug}/settings/billing`,
          },
          {
            name: "People",
            icon: Users6,
            href: `/${slug}/settings/people`,
          },
        ],
      },
      {
        name: "Developer",
        items: [
          {
            name: "Developer",
            icon: Key,
            href: "#",
            locked: true,
            badge: "Coming Soon",
          },
        ],
      },
      {
        name: "Account",
        items: [
          {
            name: "Notifications",
            icon: Bell,
            href: `/${slug}/settings/notifications`,
          },
        ],
      },
    ],
  }),

  // User settings
  userSettings: ({ slug }) => ({
    title: "Settings",
    backHref: `/${slug}`,
    hideSwitcherIcons: true,
    content: [
      {
        name: "Account",
        items: [
          {
            name: "General",
            icon: Gear2,
            href: "/account/settings",
            exact: true,
          },
          {
            name: "Security",
            icon: ShieldCheck,
            href: "/account/settings/security",
          },
          {
            name: "Referrals",
            icon: Gift,
            href: "/account/settings/referrals",
          },
        ],
      },
    ],
  }),
};

export function AppSidebarNav({
  toolContent,
  newsContent,
}: {
  toolContent?: ReactNode;
  newsContent?: ReactNode;
}) {
  const { slug } = useParams() as { slug?: string };
  const pathname = usePathname();
  const { getQueryString } = useRouterStuff();
  const { data: session } = useSession();
  const { plan, defaultProgramId } = useWorkspace();

  const currentArea = useMemo(() => {
    const area = pathname.startsWith("/account/settings")
      ? "userSettings"
      : pathname.startsWith(`/${slug}/settings`)
        ? "workspaceSettings"
        : pathname.includes("/program/messages/") ||
            pathname.endsWith("/program/payouts/success")
          ? null
          : pathname.startsWith(`/${slug}/program`)
            ? "program"
            : "default";

    // Deployment flags trump client-side heuristics so nav collapses gracefully.
    if (area === "default" && !isFeatureEnabled("links")) {
      return null;
    }

    if (area === "program" && !isFeatureEnabled("partnerProgram")) {
      return null;
    }

    return area;
  }, [slug, pathname]);

  const { program } = useProgram({
    enabled: Boolean(currentArea === "program" && defaultProgramId),
  });

  const { payoutsCount: pendingPayoutsCount } = usePayoutsCount<
    number | undefined
  >({
    eligibility: "eligible",
    status: "pending",
    enabled: Boolean(currentArea === "program" && defaultProgramId),
  });

  const applicationsCount = useProgramApplicationsCount({
    enabled: Boolean(currentArea === "program" && defaultProgramId),
  });

  const { submissionsCount } = useBountySubmissionsCount<
    SubmissionsCountByStatus[]
  >({
    enabled: Boolean(currentArea === "program" && defaultProgramId),
  });

  const submittedBountiesCount =
    submissionsCount?.find(({ status }) => status === "submitted")?.count || 0;

  const { count: unreadMessagesCount } = usePartnerMessagesCount({
    enabled: Boolean(currentArea === "program"),
    query: {
      unread: true,
    },
  });

  const { canTrackConversions } = getPlanCapabilities(plan);
  const { data: customersCount } = useCustomersCount({
    enabled: canTrackConversions === true,
  });

  return (
    <SidebarNav
      groups={NAV_GROUPS}
      areas={NAV_AREAS}
      currentArea={currentArea}
      data={{
        slug: slug || "",
        pathname,
        queryString: getQueryString(undefined, {
          include: ["folderId", "tagIds"],
        }),
        session: session || undefined,
        showNews: pathname.startsWith(`/${slug}/program`) ? false : true,
        defaultProgramId: defaultProgramId || undefined,
        pendingPayoutsCount,
        applicationsCount,
        submittedBountiesCount,
        unreadMessagesCount,
        showConversionGuides: canTrackConversions && customersCount === 0,
        partnerNetworkEnabled:
          isFeatureEnabled("partnerProgram") &&
          program?.partnerNetworkEnabledAt !== null,
      }}
      toolContent={toolContent}
      newsContent={plan && (plan === "free" ? <SidebarUsage /> : newsContent)}
      switcher={<WorkspaceDropdown />}
    />
  );
}
