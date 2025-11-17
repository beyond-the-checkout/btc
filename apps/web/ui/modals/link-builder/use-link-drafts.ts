import { LinkFormData } from "@/ui/links/link-builder/link-builder-provider";
import { QRCodeDesign } from "@/ui/modals/link-qr-modal.types";
import { useLocalStorage } from "@dub/ui";
import { subDays } from "date-fns";
import { useCallback, useLayoutEffect, useMemo } from "react";

export type LinkDraft = {
  timestamp: number;
  id: string;
  link: Partial<LinkFormData>;
  qrDesign?: QRCodeDesign;
};

export type LinkDraftsAPI = {
  drafts: LinkDraft[];
  saveDraft: (
    id: string,
    link: Partial<LinkFormData>,
    qr?: QRCodeDesign,
  ) => void;
  removeDraft: (id: string) => void;
};

/**
 * Well-known storage keys for non-workspace flows.
 */
export const LANDING_DRAFT_STORAGE_KEY = "link-drafts:landing";
export const ONBOARDING_DRAFT_STORAGE_KEY = "link-drafts:onboarding";

/**
 * Compute the storage key for drafts based on either a custom storageKey
 * or a workspaceId. Falls back to an anonymous key when neither is provided.
 */
export function computeDraftsStorageKey({
  workspaceId,
  storageKey,
}: {
  workspaceId?: string;
  storageKey?: string;
}): string {
  if (storageKey) return storageKey;
  if (workspaceId) return `link-drafts:${workspaceId}`;
  return "link-drafts:anonymous";
}

/**
 * Synchronously read drafts from localStorage and normalize them:
 * - Filter out drafts older than 7 days
 * - Sort by timestamp desc
 * - Limit to last 10 drafts
 */
export function readDraftsFromStorage(storageKey: string): LinkDraft[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    const asArray = Array.isArray(parsed) ? (parsed as LinkDraft[]) : [];
    const cutoff = subDays(new Date(), 7).getTime();

    return asArray
      .filter(
        (d) =>
          d &&
          typeof d === "object" &&
          typeof (d as LinkDraft).timestamp === "number" &&
          (d as LinkDraft).timestamp > cutoff,
      )
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
  } catch {
    return [];
  }
}

/**
 * Discriminated union: either provide workspaceId OR storageKey.
 * Backwards compatible with existing callers that pass workspaceId.
 */
export type UseLinkDraftsArgs =
  | {
      linkId?: string;
      workspaceId: string;
      storageKey?: never;
    }
  | {
      linkId?: string;
      workspaceId?: never;
      storageKey: string;
    };

export function useLinkDrafts(args: UseLinkDraftsArgs): LinkDraftsAPI {
  const key = computeDraftsStorageKey({
    workspaceId: "workspaceId" in args ? args.workspaceId : undefined,
    storageKey: "storageKey" in args ? args.storageKey : undefined,
  });

  const [drafts, setDrafts] = useLocalStorage<LinkDraft[]>(key, []);

  // Removes drafts older than 1 week, limiting to 10 drafts
  const removeOldDrafts = useCallback(() => {
    const cutoff = subDays(new Date(), 7).getTime();
    const next = (Array.isArray(drafts) ? drafts : [])
      .filter((draft) => draft.timestamp > cutoff)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
    setDrafts(next);
  }, [drafts, setDrafts]);

  // Initialize / clean up drafts
  useLayoutEffect(() => {
    if (!Array.isArray(drafts)) setDrafts([]);
    else removeOldDrafts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveDraft = (
    id: string,
    link: Partial<LinkFormData>,
    qrDesign?: QRCodeDesign,
  ) => {
    const existing = drafts.find((d) => d.id === id);
    const mergedLink = { ...(existing?.link ?? {}), ...link };
    const merged: LinkDraft = {
      id,
      link: mergedLink,
      qrDesign: qrDesign !== undefined ? qrDesign : existing?.qrDesign,
      timestamp: Date.now(),
    };
    setDrafts([merged, ...drafts.filter((d) => d.id !== id)]);
  };

  const removeDraft = (id: string) => {
    setDrafts(drafts.filter((draft) => draft.id !== id));
  };

  const filteredDrafts = useMemo(() => {
    const list =
      "linkId" in args && args.linkId
        ? drafts.filter((draft) => draft.link.id === args.linkId)
        : drafts.filter((draft) => !draft.link.id);
    return list.slice().sort((a, b) => b.timestamp - a.timestamp);
  }, [drafts, args]);

  return { drafts: filteredDrafts, saveDraft, removeDraft };
}
