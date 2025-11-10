import { MainNav } from "@/ui/layout/main-nav";
import { AppSidebarNav } from "@/ui/layout/sidebar/app-sidebar-nav";
import { HelpButtonRSC } from "@/ui/layout/sidebar/help-button-rsc";
import { NewsRSC } from "@/ui/layout/sidebar/news-rsc";
import { ReferButton } from "@/ui/layout/sidebar/refer-button";
import Toolbar from "@/ui/layout/toolbar/toolbar";
import { UpgradeBanner } from "@/ui/layout/upgrade-banner";
import { constructMetadata } from "@dub/utils";
import { ReactNode } from "react";

export const dynamic = "force-static";
export const metadata = constructMetadata();

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="min-h-screen w-full bg-white">
        <UpgradeBanner />
        <MainNav
          sidebar={AppSidebarNav}
          toolContent={
            <>
              {/* SIDEBAR_BUTTONS_DISABLED_BTCAYY4
                  Referrals and Help buttons disabled from sidebar display.
                  Functionality preserved - just hidden from UI.
                  Related bead: btc-ayy4
              */}
              {/* <ReferButton /> */}
              {/* <HelpButtonRSC /> */}
            </>
          }
          newsContent={<NewsRSC />}
        >
          {children}
        </MainNav>
      </div>
      <Toolbar show={["onboarding"]} />
    </>
  );
}
