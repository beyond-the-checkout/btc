import { LinkFormData } from "@/ui/links/link-builder/link-builder-provider";
import {
  LinkDraft,
  LinkDraftsAPI,
} from "@/ui/modals/link-builder/use-link-drafts";
import { QRCodeDesign } from "@/ui/modals/link-qr-modal.types";

export type SaveEvent = {
  id: string;
  link: Partial<LinkFormData>;
  qr?: QRCodeDesign;
  timestamp: number;
};

export function createInMemoryDraftPersistence(initial?: LinkDraft[]) {
  let drafts: LinkDraft[] = Array.isArray(initial)
    ? initial.slice().sort((a, b) => b.timestamp - a.timestamp)
    : [];

  let events: SaveEvent[] = [];

  const api: LinkDraftsAPI = {
    get drafts() {
      return drafts;
    },
    saveDraft: (id: string, link: Partial<LinkFormData>, qr?: QRCodeDesign) => {
      const now = Date.now();
      const existing = drafts.find((d) => d.id === id);
      const mergedLink: Partial<LinkFormData> = {
        ...(existing?.link ?? {}),
        ...link,
      };

      const merged: LinkDraft = {
        id,
        link: mergedLink,
        qrDesign: qr !== undefined ? qr : existing?.qrDesign,
        timestamp: now,
      };

      drafts = [merged, ...drafts.filter((d) => d.id !== id)];

      events.push({
        id,
        link: mergedLink,
        qr,
        timestamp: now,
      });
    },
    removeDraft: (id: string) => {
      drafts = drafts.filter((d) => d.id !== id);
    },
  };

  return {
    api,
    getDrafts: (): LinkDraft[] => drafts,
    getSaveEvents: (): SaveEvent[] => events,
    clear: (): void => {
      drafts = [];
      events = [];
    },
  };
}