import { constructMetadata } from "@dub/utils";
import PlaceholderContent from "./placeholder";

export const revalidate = false; // cache indefinitely

export async function generateMetadata(props: { params: Promise<{ domain: string }> }) {
  const params = await props.params;
  const title = `${params.domain.toUpperCase()} - A ${
    process.env.NEXT_PUBLIC_APP_NAME
  } Custom Domain`;
  const description = `${params.domain.toUpperCase()} is powered by ${
    process.env.NEXT_PUBLIC_APP_NAME
  } - a QR-driven engagement platform that lets brands issue instant Bitcoin incentives for completing simple actions while capturing first-party data.`;

  return constructMetadata({
    title,
    description,
  });
}

export default function CustomDomainPage() {
  return <PlaceholderContent />;
}
