import { CHECKOUT_WORDMARK } from "@dub/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import WrappedPageClient from "./client";

export default async function WrappedPage(
  props: {
    params: Promise<{ slug: string; year: string }>;
  }
) {
  const params = await props.params;
  if (params.year !== "2024") {
    redirect(`/${params.slug}`);
  }

  return (
    <div className="relative flex flex-col items-center">
      <Link href={`/${params.slug}`}>
        <img src={CHECKOUT_WORDMARK} alt="Beyond the Checkout" className="mt-6 w-32 h-auto" />
      </Link>
      <WrappedPageClient />
    </div>
  );
}
