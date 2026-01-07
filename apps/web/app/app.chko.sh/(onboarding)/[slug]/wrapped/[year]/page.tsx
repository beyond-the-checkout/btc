import { CHECKOUT_WORDMARK } from "@dub/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import WrappedPageClient from "./client";

export default async function WrappedPage(props: {
  params: Promise<{ slug: string; year: string }>;
}) {
  const params = await props.params;
  if (params.year !== "2024") {
    redirect(`/${params.slug}`);
  }

  return (
    <div className="relative flex flex-col items-center">
      <Link href={`/${params.slug}`}>
        <img
          src={CHECKOUT_WORDMARK}
          alt="ForeverQRs"
          className="mt-6 h-auto w-32"
        />
      </Link>
      <WrappedPageClient />
    </div>
  );
}
