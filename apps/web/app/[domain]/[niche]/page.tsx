import { constructMetadata, isMarketingDomain, NicheSlug } from "@dub/utils";
import { redirect } from "next/navigation";

import { getNicheConfig, hasNicheConfig } from "@/lib/niches";
import NichePlaceholderContent from "./placeholder";

export const revalidate = false;

export async function generateMetadata(props: {
  params: Promise<{ domain: string; niche: string }>;
}) {
  const { domain, niche } = await props.params;

  if (!isMarketingDomain(domain) || !hasNicheConfig(niche)) {
    return constructMetadata();
  }

  const config = getNicheConfig(niche as NicheSlug);

  return constructMetadata({
    title: config?.metadata.title,
    description: config?.metadata.description,
  });
}

export default async function NicheLandingPage(props: {
  params: Promise<{ domain: string; niche: string }>;
}) {
  const { domain, niche } = await props.params;

  if (!isMarketingDomain(domain) || !hasNicheConfig(niche)) {
    return redirect("/");
  }

  return <NichePlaceholderContent />;
}