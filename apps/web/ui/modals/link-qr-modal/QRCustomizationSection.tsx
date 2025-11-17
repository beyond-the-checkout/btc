import {
  CORNER_DOT_TYPES,
  CORNER_SQUARE_TYPES,
  CornerDotType,
  CornerSquareType,
  DOT_TYPES,
} from "@/lib/qr/constants";
import { Tooltip } from "@dub/ui";
import { cn } from "@dub/utils";
import { useLinkQRContext } from "../link-qr-modal.context";
import {
  CornerDotPreview,
  CornerSquarePreview,
  PatternPreview,
} from "./components/preview-icons";

export function QRCustomizationSection(): JSX.Element {
  const { id, draft, setDraft, plan, slug } = useLinkQRContext();

  return (
    <>
      {/* Dot Pattern selector */}
      <div>
        <span className="mb-2 block text-sm font-medium text-neutral-700">
          Dot Pattern
        </span>
        <div className="flex flex-wrap items-center gap-3">
          {DOT_TYPES.map((pattern) => {
            const isSelected = draft.qrDotType === pattern;
            const patternLabels: Record<
              "square" | "rounded" | "dots" | "classy" | "extra-rounded",
              string
            > = {
              square: "Square",
              rounded: "Rounded",
              dots: "Dots",
              classy: "Classy",
              "extra-rounded": "Extra Rounded",
            };
            return (
              <Tooltip key={pattern} content={patternLabels[pattern]}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={`Select ${patternLabels[pattern]} pattern`}
                  onClick={() =>
                    setDraft((d) => ({ ...d, qrDotType: pattern }))
                  }
                  className={cn(
                    "flex size-12 items-center justify-center rounded-md border transition-all",
                    isSelected
                      ? "border-black bg-neutral-50 ring-1 ring-black"
                      : "hover:border-border-emphasis border-neutral-200 hover:bg-neutral-50",
                  )}
                >
                  <PatternPreview pattern={pattern} color={draft.fgColor} />
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Eye Pattern selectors */}
      <div>
        <span className="block text-sm font-medium text-neutral-700">
          Corner Eyes
        </span>
        <div className="mt-3 space-y-3">
          {/* Outer Frame (Corner Square) */}
          <div>
            <label className="mb-2 block text-xs font-medium text-neutral-600">
              Outer Frame
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {CORNER_SQUARE_TYPES.map((type) => {
                const isSelected = draft.qrCornerSquareType === type;
                const typeLabels: Record<CornerSquareType, string> = {
                  square: "Square",
                  rounded: "Rounded",
                  dots: "Circle",
                  "extra-rounded": "Extra Rounded",
                  leaf: "Leaf",
                };
                return (
                  <Tooltip key={type} content={typeLabels[type]}>
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      aria-label={`Select ${typeLabels[type]} outer frame`}
                      onClick={() =>
                        setDraft((d) => ({
                          ...d,
                          qrCornerSquareType: type,
                        }))
                      }
                      className={cn(
                        "flex size-12 items-center justify-center rounded-md border transition-all",
                        isSelected
                          ? "border-black bg-neutral-50 ring-1 ring-black"
                          : "hover:border-border-emphasis border-neutral-200 hover:bg-neutral-50",
                      )}
                    >
                      <CornerSquarePreview type={type} color={draft.fgColor} />
                    </button>
                  </Tooltip>
                );
              })}
            </div>
          </div>

          {/* Inner Dot (Corner Dot) */}
          <div>
            <label className="mb-2 block text-xs font-medium text-neutral-600">
              Inner Dot
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {CORNER_DOT_TYPES.map((type) => {
                const isSelected = draft.qrCornerDotType === type;
                const typeLabels: Record<CornerDotType, string> = {
                  square: "Square",
                  dots: "Circle",
                  rounded: "Rounded",
                };
                return (
                  <Tooltip key={type} content={typeLabels[type]}>
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      aria-label={`Select ${typeLabels[type]} inner dot`}
                      onClick={() =>
                        setDraft((d) => ({ ...d, qrCornerDotType: type }))
                      }
                      className={cn(
                        "flex size-12 items-center justify-center rounded-md border transition-all",
                        isSelected
                          ? "border-black bg-neutral-50 ring-1 ring-black"
                          : "hover:border-border-emphasis border-neutral-200 hover:bg-neutral-50",
                      )}
                    >
                      <CornerDotPreview type={type} color={draft.fgColor} />
                    </button>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* QR Shape and Frame Style side by side */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* QR Shape selector */}
        <div>
          <span className="mb-2 block text-sm font-medium text-neutral-700">
            QR Code Shape
          </span>
          <div className="flex items-center gap-3">
            <Tooltip content="Square">
              <button
                type="button"
                aria-pressed={draft.qrShape === "square"}
                aria-label="Select square shape"
                onClick={() =>
                  setDraft((d) => {
                    // Auto-convert circle frames to square frames when switching shape
                    const newFrameStyle = d.qrFrameStyle
                      ? d.qrFrameStyle === "solid-circle" ||
                        d.qrFrameStyle === "dotted-circle"
                        ? "square"
                        : d.qrFrameStyle
                      : undefined;
                    return {
                      ...d,
                      qrShape: "square",
                      qrFrameStyle: newFrameStyle,
                      hasFrame: !!newFrameStyle,
                    };
                  })
                }
                className={cn(
                  "flex size-12 items-center justify-center rounded-md border transition-all",
                  draft.qrShape === "square"
                    ? "border-black bg-neutral-50 ring-1 ring-black"
                    : "hover:border-border-emphasis border-neutral-200 hover:bg-neutral-50",
                )}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="6"
                    y="6"
                    width="12"
                    height="12"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </button>
            </Tooltip>
            <Tooltip content="Circle">
              <button
                type="button"
                aria-pressed={draft.qrShape === "circle"}
                aria-label="Select circle shape"
                onClick={() =>
                  setDraft((d) => {
                    // Auto-convert square frames to circle frames when switching shape
                    const newFrameStyle = d.qrFrameStyle
                      ? d.qrFrameStyle === "square" ||
                        d.qrFrameStyle === "rounded"
                        ? "solid-circle"
                        : d.qrFrameStyle
                      : undefined;
                    return {
                      ...d,
                      qrShape: "circle",
                      qrFrameStyle: newFrameStyle,
                      hasFrame: !!newFrameStyle,
                    };
                  })
                }
                className={cn(
                  "flex size-12 items-center justify-center rounded-md border transition-all",
                  draft.qrShape === "circle"
                    ? "border-black bg-neutral-50 ring-1 ring-black"
                    : "hover:border-border-emphasis border-neutral-200 hover:bg-neutral-50",
                )}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="6"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Frame style selector - Always visible with "No Frame" option */}
        <div>
          <span className="mb-2 block text-sm font-medium text-neutral-700">
            Frame Style
          </span>
          <div className="flex items-center gap-3">
            {/* No Frame option - always available */}
            <Tooltip content="No Frame">
              <button
                type="button"
                aria-pressed={draft.qrFrameStyle === undefined}
                aria-label="No frame"
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    qrFrameStyle: undefined,
                    hasFrame: false,
                  }))
                }
                className={cn(
                  "flex size-12 items-center justify-center rounded-md border transition-all",
                  draft.qrFrameStyle === undefined
                    ? "border-black bg-neutral-50 ring-1 ring-black"
                    : "hover:border-border-emphasis border-neutral-200 hover:bg-neutral-50",
                )}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <line
                    x1="4"
                    y1="20"
                    x2="20"
                    y2="4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </Tooltip>
            {draft.qrShape === "square" ? (
              <>
                <Tooltip content="Square">
                  <button
                    type="button"
                    aria-pressed={draft.qrFrameStyle === "square"}
                    aria-label="Select square frame"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        qrFrameStyle: "square",
                        hasFrame: true,
                      }))
                    }
                    className={cn(
                      "flex size-12 items-center justify-center rounded-md border transition-all",
                      draft.qrFrameStyle === "square"
                        ? "border-black bg-neutral-50 ring-1 ring-black"
                        : "hover:border-border-emphasis border-neutral-200 hover:bg-neutral-50",
                    )}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect
                        x="6"
                        y="6"
                        width="12"
                        height="12"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                      />
                    </svg>
                  </button>
                </Tooltip>
                <Tooltip content="Rounded">
                  <button
                    type="button"
                    aria-pressed={draft.qrFrameStyle === "rounded"}
                    aria-label="Select rounded frame"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        qrFrameStyle: "rounded",
                        hasFrame: true,
                      }))
                    }
                    className={cn(
                      "flex size-12 items-center justify-center rounded-md border transition-all",
                      draft.qrFrameStyle === "rounded"
                        ? "border-black bg-neutral-50 ring-1 ring-black"
                        : "hover:border-border-emphasis border-neutral-200 hover:bg-neutral-50",
                    )}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect
                        x="6"
                        y="6"
                        width="12"
                        height="12"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                      />
                    </svg>
                  </button>
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip content="Solid Circle">
                  <button
                    type="button"
                    aria-pressed={draft.qrFrameStyle === "solid-circle"}
                    aria-label="Select solid circle frame"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        qrFrameStyle: "solid-circle",
                      }))
                    }
                    className={cn(
                      "flex size-12 items-center justify-center rounded-md border transition-all",
                      draft.qrFrameStyle === "solid-circle"
                        ? "border-black bg-neutral-50 ring-1 ring-black"
                        : "hover:border-border-emphasis border-neutral-200 hover:bg-neutral-50",
                    )}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle
                        cx="12"
                        cy="12"
                        r="6"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                      />
                    </svg>
                  </button>
                </Tooltip>
                <Tooltip content="Dotted Circle">
                  <button
                    type="button"
                    aria-pressed={draft.qrFrameStyle === "dotted-circle"}
                    aria-label="Select dotted circle frame"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        qrFrameStyle: "dotted-circle",
                      }))
                    }
                    className={cn(
                      "flex size-12 items-center justify-center rounded-md border transition-all",
                      draft.qrFrameStyle === "dotted-circle"
                        ? "border-black bg-neutral-50 ring-1 ring-black"
                        : "hover:border-border-emphasis border-neutral-200 hover:bg-neutral-50",
                    )}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle
                        cx="12"
                        cy="12"
                        r="6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="2 2"
                        fill="none"
                      />
                    </svg>
                  </button>
                </Tooltip>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
