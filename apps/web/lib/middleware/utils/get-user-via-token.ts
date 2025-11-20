import { UserProps } from "@/lib/types";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function getUserViaToken(req: NextRequest) {
  try {
    const session = (await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      // Use the same cookie name as configured in authOptions
      cookieName: process.env.VERCEL_URL
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
    })) as {
      email?: string;
      user?: UserProps;
    };

    return session?.user;
  } catch (error) {
    console.error("Error getting user via token:", error);
    return undefined;
  }
}
