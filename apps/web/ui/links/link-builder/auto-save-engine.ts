import {
  LinkDraft,
  LinkDraftsAPI,
} from "@/ui/modals/link-builder/use-link-drafts";
import { QRCodeDesign } from "@/ui/modals/link-qr-modal.types";
import { LinkFormData } from "./link-builder-provider";

/**
 * Keys used for shallow QR design equality comparisons.
 * Note: hasFrame is a computed value and intentionally omitted for persistence comparisons.
 */
const DESIGN_KEYS: (keyof QRCodeDesign)[] = [
  "fgColor",
  "qrHideLogo",
  "qrDotType",
  "qrCornerSquareType",
  "qrCornerDotType",
  "qrShape",
  "qrFrameStyle",
  "qrFrameColor",
  "qrDotsColor",
  "qrCornerSquareColor",
  "qrCornerDotColor",
];

export function shallowEqualQr(a?: QRCodeDesign, b?: QRCodeDesign): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  for (const k of DESIGN_KEYS) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}

type Debouncer = {
  schedule: (fn: () => void) => void;
  flush: () => boolean;
  cancel: () => void;
};

export function createDebouncer(ms: number): Debouncer {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let last: (() => void) | null = null;

  return {
    schedule(fn: () => void) {
      last = fn;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      timer = setTimeout(() => {
        timer = null;
        const toRun = last;
        last = null;
        if (toRun) toRun();
      }, ms);
    },
    flush() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      const toRun = last;
      last = null;
      if (toRun) {
        toRun();
        return true;
      }
      return false;
    },
    cancel() {
      if (timer) {
        clearTimeout(timer);
      }
      timer = null;
      last = null;
    },
  };
}

export type PendingOnSwitch = "flush" | "cancel";

export type DraftAutoSaveEngineOptions = {
  debounceMs: number;
  persistence: LinkDraftsAPI;
  getActiveDraftId: () => string;
  getLink: () => Partial<LinkFormData>;
  getQr: () => QRCodeDesign | undefined;
  isRestoring?: () => boolean;
  onBeforeSave?: () => void;
  onAfterSave?: () => void;
  pendingOnSwitch?: PendingOnSwitch;
};

export type DraftAutoSaveEngineState = {
  isSavePending: boolean;
  hasSaved: boolean;
};

/**
 * Headless controller that orchestrates draft autosave behavior.
 * - Coalesces rapid changes via debounce
 * - Tracks QR-only updates and persists them
 * - Flushes on close/unmount
 * - Supports configurable pending behavior on draft switching
 */
export class DraftAutoSaveEngine {
  private readonly opts: DraftAutoSaveEngineOptions;
  private readonly debouncer: Debouncer;
  private pendingOnSwitch: PendingOnSwitch;

  private prevQr: QRCodeDesign | undefined;
  private isSavePending = false;
  private hasSaved = false;

  constructor(opts: DraftAutoSaveEngineOptions) {
    this.opts = opts;
    this.debouncer = createDebouncer(opts.debounceMs);
    this.pendingOnSwitch = opts.pendingOnSwitch ?? "flush";
    this.prevQr = opts.getQr();
  }

  getState(): DraftAutoSaveEngineState {
    return {
      isSavePending: this.isSavePending,
      hasSaved: this.hasSaved,
    };
  }

  onFormChange(): void {
    if (this.opts.isRestoring?.()) return;

    const link = this.opts.getLink();
    if (!this.hasSufficientContext(link)) return;

    this.scheduleSave();
  }

  onQrChange(): void {
    const next = this.opts.getQr();
    const prev = this.prevQr;

    // Update prev first so subsequent equality checks use latest reference
    this.prevQr = next;

    if (this.opts.isRestoring?.()) return;
    if (shallowEqualQr(prev, next)) return;

    const link = this.opts.getLink();
    if (!this.hasSufficientContext(link)) return;

    this.scheduleSave();
  }

  onDraftSwitch(_next: LinkDraft): void {
    if (this.pendingOnSwitch === "cancel") {
      this.debouncer.cancel();
      this.isSavePending = false;
    } else {
      // flush is the default
      this.debouncer.flush();
      this.isSavePending = false;
      // hasSaved may or may not change depending on whether there was a pending save
      this.hasSaved = this.hasSaved || false;
    }
  }

  onClose(isDirty?: boolean): void {
    // Flush any pending debounced saves first; if something ran, avoid duplicate save
    const flushed = this.debouncer.flush();
    this.isSavePending = false;

    if (flushed) return;

    const link = this.opts.getLink();
    if (!this.hasSufficientContext(link)) return;
    if (!isDirty) return;

    // Only perform synchronous save if nothing was flushed
    const id = this.opts.getActiveDraftId();
    const qr = this.opts.getQr();

    this.opts.onBeforeSave?.();
    this.opts.persistence.saveDraft(id, link, qr);
    this.hasSaved = true;
    this.opts.onAfterSave?.();
  }

  dispose(): void {
    this.debouncer.flush();
    this.isSavePending = false;
  }

  private scheduleSave(): void {
    this.isSavePending = true;

    this.debouncer.schedule(() => {
      const id = this.opts.getActiveDraftId();
      const link = this.opts.getLink();
      const qr = this.opts.getQr();

      // Double-check context at execution time
      if (!this.hasSufficientContext(link)) {
        this.isSavePending = false;
        return;
      }

      this.opts.onBeforeSave?.();
      this.opts.persistence.saveDraft(id, link, qr);
      this.isSavePending = false;
      this.hasSaved = true;
      this.opts.onAfterSave?.();
    });
  }

  private hasSufficientContext(
    link: Partial<LinkFormData> | undefined,
  ): boolean {
    return Boolean(link && ((link as any).url || (link as any).key));
  }
}
