import { NextResponse } from "next/server";

/**
 * Debug endpoint to check environment variables
 * Only works in preview/development, not production
 */
export const GET = async () => {
  // Block in production
  if (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

  return NextResponse.json({
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
    },
    stripe: {
      secretKeyPrefix: stripeSecretKey.substring(0, 25),
      secretKeySet: !!stripeSecretKey,
      secretKeyLength: stripeSecretKey.length,
      publishableKeyPrefix: stripePublishableKey.substring(0, 25),
      publishableKeySet: !!stripePublishableKey,
      publishableKeyLength: stripePublishableKey.length,
      keysMatchAccount: stripeSecretKey.substring(8, 20) === stripePublishableKey.substring(8, 20),
    },
    beyondtc: {
      workspaceIdSet: !!process.env.BEYONDTC_WORKSPACE_ID,
      workspaceId: process.env.BEYONDTC_WORKSPACE_ID,
    },
  });
};
