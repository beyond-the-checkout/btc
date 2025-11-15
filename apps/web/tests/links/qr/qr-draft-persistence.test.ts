import { DraftAutoSaveEngine } from "@/ui/links/link-builder/auto-save-engine";
import type { LinkFormData } from "@/ui/links/link-builder/link-builder-provider";
import type { LinkDraft } from "@/ui/modals/link-builder/use-link-drafts";
import type { QRCodeDesign } from "@/ui/modals/link-qr-modal.types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { withColors } from "../../fixtures/qrDesign";
import { createInMemoryDraftPersistence } from "../../mocks/draftPersistence";

const DEBOUNCE_MS = 20;

type MakeEngineOpts = Partial<{
  debounceMs: number;
  initialLink: Partial<LinkFormData>;
  initialQr: QRCodeDesign | undefined;
  activeDraftId: string;
  pendingOnSwitch: "flush" | "cancel";
}>;

function makeEngine(opts: MakeEngineOpts = {}) {
  const persistence = createInMemoryDraftPersistence();

  let link: Partial<LinkFormData> = opts.initialLink ?? {
    url: "https://example.com",
    key: "test",
    domain: "dub.sh",
  };

  let qr: QRCodeDesign | undefined = opts.initialQr;

  const engine = new DraftAutoSaveEngine({
    debounceMs: opts.debounceMs ?? DEBOUNCE_MS,
    persistence: persistence.api,
    getActiveDraftId: () => opts.activeDraftId ?? "session-1",
    getLink: () => link,
    getQr: () => qr,
    pendingOnSwitch: opts.pendingOnSwitch ?? "flush",
  });

  return {
    engine,
    persistence,
    setLink: (updates: Partial<LinkFormData>) => {
      link = { ...link, ...updates };
    },
    setQr: (design: QRCodeDesign | undefined) => {
      qr = design;
    },
    getLink: () => link,
    getQr: () => qr,
  };
}

function makeDraft(id: string, url = "https://a.test", key = "a"): LinkDraft {
  return {
    id,
    timestamp: Date.now(),
    link: { domain: "dub.sh", key, url },
    qrDesign: withColors({ fgColor: "#000000" }),
  };
}

describe("DraftAutoSaveEngine - QR Draft Persistence", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    try {
      vi.runOnlyPendingTimers();
    } catch {}
    vi.useRealTimers();
  });

  it("auto-saves QR color changes with debounce", async () => {
    const { engine, persistence, setQr } = makeEngine();

    setQr(withColors({ fgColor: "#111111" }));
    engine.onQrChange();

    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS + 5);

    const saves = persistence.getSaveEvents();
    expect(saves).toHaveLength(1);
    expect(saves[0].qr?.fgColor).toBe("#111111");
  });

  it("coalesces rapid QR changes to last value", async () => {
    const { engine, persistence, setQr } = makeEngine();

    setQr(withColors({ fgColor: "#111111" }));
    engine.onQrChange();
    setQr(withColors({ fgColor: "#222222" }));
    engine.onQrChange();
    setQr(withColors({ fgColor: "#333333" }));
    engine.onQrChange();

    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS + 5);

    const saves = persistence.getSaveEvents();
    expect(saves).toHaveLength(1);
    expect(saves[0].qr?.fgColor).toBe("#333333");
  });

  it("flushes pending saves on close", async () => {
    const { engine, persistence, setQr } = makeEngine({ debounceMs: 50 });

    setQr(withColors({ fgColor: "#abcd12" }));
    engine.onQrChange();

    // Do not advance timers; closing should flush pending and perform a final synchronous save.
    engine.onClose(true);

    const saves = persistence.getSaveEvents();
    expect(saves.length).toBeGreaterThanOrEqual(1);
    const last = saves[saves.length - 1];
    expect(last.qr?.fgColor).toBe("#abcd12");
  });

  it("persists concurrent form + QR edits together", async () => {
    const { engine, persistence, setLink, setQr } = makeEngine();

    setLink({ url: "https://example.com/merge" });
    setQr(withColors({ fgColor: "#123456" }));
    // Trigger only one change event; engine reads latest link+qr at execution
    engine.onQrChange();

    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS + 5);

    const saves = persistence.getSaveEvents();
    expect(saves).toHaveLength(1);
    expect(saves[0].link.url).toBe("https://example.com/merge");
    expect(saves[0].qr?.fgColor).toBe("#123456");
  });

  it("sequential changes yield multiple saves", async () => {
    const { engine, persistence, setQr } = makeEngine();

    setQr(withColors({ fgColor: "#111111" }));
    engine.onQrChange();
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS + 5);

    setQr(withColors({ fgColor: "#222222" }));
    engine.onQrChange();
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS + 5);

    const saves = persistence.getSaveEvents();
    expect(saves).toHaveLength(2);
    expect(saves[0].qr?.fgColor).toBe("#111111");
    expect(saves[1].qr?.fgColor).toBe("#222222");
  });

  it("no-op QR changes don't trigger additional saves", async () => {
    const { engine, persistence, setQr } = makeEngine();

    setQr(withColors({ fgColor: "#101010" }));
    engine.onQrChange();
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS + 5);

    // Same value again should be treated as no-op
    setQr(withColors({ fgColor: "#101010" }));
    engine.onQrChange();
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS + 5);

    const saves = persistence.getSaveEvents();
    expect(saves).toHaveLength(1);
    expect(saves[0].qr?.fgColor).toBe("#101010");
  });

  it("unmount cleanup flushes pending saves", async () => {
    const { engine, persistence, setQr } = makeEngine({ debounceMs: 50 });

    setQr(withColors({ fgColor: "#00aa00" }));
    engine.onQrChange();

    // Simulate unmount; should flush pending save
    engine.dispose();

    const saves = persistence.getSaveEvents();
    expect(saves.length).toBeGreaterThanOrEqual(1);
    const last = saves[saves.length - 1];
    expect(last.qr?.fgColor).toBe("#00aa00");
  });

  it("persists split color fields cohesively", async () => {
    const { engine, persistence, setQr } = makeEngine();

    setQr(
      withColors({
        fgColor: "#ff0000",
        qrDotsColor: "#00ff00",
        qrCornerSquareColor: "#0000ff",
        qrCornerDotColor: "#ffff00",
      }),
    );
    engine.onQrChange();

    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS + 5);

    const saves = persistence.getSaveEvents();
    expect(saves).toHaveLength(1);
    const qr = saves[0].qr!;
    expect(qr.fgColor).toBe("#ff0000");
    expect(qr.qrDotsColor).toBe("#00ff00");
    expect(qr.qrCornerSquareColor).toBe("#0000ff");
    expect(qr.qrCornerDotColor).toBe("#ffff00");
  });

  it("cancels pending saves on draft switch mid-debounce when pendingOnSwitch='cancel'", async () => {
    const { engine, persistence, setQr } = makeEngine({
      debounceMs: 100,
      pendingOnSwitch: "cancel",
    });

    setQr(withColors({ fgColor: "#aaaaaa" }));
    engine.onQrChange();

    // Switch drafts before debounce elapses; should cancel pending save
    const next: LinkDraft = makeDraft("draft-next", "https://n.test", "n");
    engine.onDraftSwitch(next);

    // Do not advance timers
    const saves = persistence.getSaveEvents();
    expect(saves).toHaveLength(0);
  });

  it("flushes pending saves on draft switch by default (pendingOnSwitch='flush')", async () => {
    const { engine, persistence, setQr } = makeEngine({
      debounceMs: 100,
      pendingOnSwitch: "flush",
    });

    setQr(withColors({ fgColor: "#bbbbbb" }));
    engine.onQrChange();

    // Switch drafts before debounce elapses; default behavior should flush
    const next: LinkDraft = makeDraft("other", "https://o.test", "o");
    engine.onDraftSwitch(next);

    // Without advancing timers, we expect one save due to flush
    const saves = persistence.getSaveEvents();
    expect(saves).toHaveLength(1);
    expect(saves[0].qr?.fgColor).toBe("#bbbbbb");
  });

  it("does not save when isRestoring is true", async () => {
    let restoring = true;
    const persistence = createInMemoryDraftPersistence();

    const engine = new DraftAutoSaveEngine({
      debounceMs: DEBOUNCE_MS,
      persistence: persistence.api,
      getActiveDraftId: () => "session-1",
      getLink: () => ({ url: "https://r.test", key: "r", domain: "dub.sh" }),
      getQr: () => withColors({ fgColor: "#aa0000" }),
      isRestoring: () => restoring,
    });

    engine.onQrChange(); // Should be suppressed

    restoring = false;
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS + 5);

    expect(persistence.getSaveEvents()).toHaveLength(0);
  });
});
