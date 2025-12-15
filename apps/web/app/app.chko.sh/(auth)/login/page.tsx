import { brandName } from "@/lib/branding";
import LoginForm from "@/ui/auth/login/login-form";
import { AuthLayout } from "@/ui/layout/auth-layout";
import { APP_DOMAIN, constructMetadata } from "@dub/utils";
import Link from "next/link";

export const metadata = constructMetadata({
  title: `Sign in to ${brandName()}`,
  canonicalUrl: `${APP_DOMAIN}/login`,
});

/**
 * Build the register link preserving `next` and `source` query params.
 */
function buildRegisterLink(
  searchParams: Record<string, string | string[] | undefined>,
): string {
  const params = new URLSearchParams();
  const next = searchParams.next;
  const source = searchParams.source;

  if (typeof next === "string") params.set("next", next);
  if (typeof source === "string") params.set("source", source);

  const queryString = params.toString();
  return queryString ? `/register?${queryString}` : "/register";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await searchParams;

  return (
    <AuthLayout showTerms="app">
      <div className="w-full max-w-sm">
        <h3 className="text-center text-xl font-semibold">
          Log in to your {brandName()} account
        </h3>
        <div className="mt-8">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-sm font-medium text-neutral-500">
          Don't have an account?&nbsp;
          <Link
            href={buildRegisterLink(resolvedParams)}
            className="font-semibold text-neutral-700 transition-colors hover:text-neutral-900"
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
