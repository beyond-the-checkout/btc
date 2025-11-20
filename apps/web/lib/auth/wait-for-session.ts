"use client";

import { getSession as getClientSession } from "next-auth/react";

export type WaitForSessionOptions = {
  timeoutMs?: number; // default 5000
  intervalMs?: number; // default 200
  requireUserId?: boolean; // default true
};

/**
 * Polls next-auth client session until a user is present or timeout is reached.
 * Returns true if session becomes available; false on timeout.
 */
export async function waitForAuthSession(
  opts: WaitForSessionOptions = {},
): Promise<boolean> {
  const {
    timeoutMs = 5000,
    intervalMs = 200,
    requireUserId = true,
  } = opts;

  const isReady = (session: any) =>
    !!session?.user && (!requireUserId || !!(session.user as any).id);

  // Quick first try
  try {
    const session = await getClientSession();
    if (isReady(session)) {
      return true;
    }
  } catch {
    // ignore
  }

  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    await new Promise((r) => setTimeout(r, intervalMs));
    try {
      const session = await getClientSession();
      if (isReady(session)) {
        return true;
      }
    } catch {
      // ignore
    }
  }

  return false;
}