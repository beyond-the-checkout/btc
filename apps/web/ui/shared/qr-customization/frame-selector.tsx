import { Tooltip, cn } from "@dub/ui";

type FrameStyle = "square" | "rounded" | "solid-circle" | "dotted-circle" | undefined;

interface FrameSelectorProps {
  value: FrameStyle;
  onChange: (frame: FrameStyle) => void;
  qrShape: "square" | "circle";
  label?: string;
}

export function FrameSelector({
  value,
  onChange,
  qrShape,
  label = "Frame Style",
}: FrameSelectorProps) {
  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-neutral-700">
        {label}
      </span>
      <div className="flex items-center gap-3">
        {/* No Frame option - always available */}
        <Tooltip content="No Frame">
          <button
            type="button"
            aria-pressed={value === undefined}
            aria-label="No frame"
            onClick={() => onChange(undefined)}
            className={cn(
              "flex size-12 items-center justify-center rounded-md border transition-all",
              value === undefined
                ? "border-black bg-neutral-50 ring-1 ring-black"
                : "border-neutral-200 hover:border-border-emphasis hover:bg-neutral-50",
            )}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="8" y="8" width="8" height="8" fill="#f5f5f5" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
              <line x1="8" y1="8" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
              <line x1="16" y1="8" x2="8" y2="16" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
            </svg>
          </button>
        </Tooltip>

        {/* Shape-specific frames */}
        {qrShape === "square" ? (
          <>
            <Tooltip content="Square">
              <button
                type="button"
                aria-pressed={value === "square"}
                aria-label="Select square frame"
                onClick={() => onChange("square")}
                className={cn(
                  "flex size-12 items-center justify-center rounded-md border transition-all",
                  value === "square"
                    ? "border-black bg-neutral-50 ring-1 ring-black"
                    : "border-neutral-200 hover:border-border-emphasis hover:bg-neutral-50",
                )}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="6" y="6" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </button>
            </Tooltip>
            <Tooltip content="Rounded">
              <button
                type="button"
                aria-pressed={value === "rounded"}
                aria-label="Select rounded frame"
                onClick={() => onChange("rounded")}
                className={cn(
                  "flex size-12 items-center justify-center rounded-md border transition-all",
                  value === "rounded"
                    ? "border-black bg-neutral-50 ring-1 ring-black"
                    : "border-neutral-200 hover:border-border-emphasis hover:bg-neutral-50",
                )}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </button>
            </Tooltip>
          </>
        ) : (
          <>
            <Tooltip content="Solid Circle">
              <button
                type="button"
                aria-pressed={value === "solid-circle"}
                aria-label="Select solid circle frame"
                onClick={() => onChange("solid-circle")}
                className={cn(
                  "flex size-12 items-center justify-center rounded-md border transition-all",
                  value === "solid-circle"
                    ? "border-black bg-neutral-50 ring-1 ring-black"
                    : "border-neutral-200 hover:border-border-emphasis hover:bg-neutral-50",
                )}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </button>
            </Tooltip>
            <Tooltip content="Dotted Circle">
              <button
                type="button"
                aria-pressed={value === "dotted-circle"}
                aria-label="Select dotted circle frame"
                onClick={() => onChange("dotted-circle")}
                className={cn(
                  "flex size-12 items-center justify-center rounded-md border transition-all",
                  value === "dotted-circle"
                    ? "border-black bg-neutral-50 ring-1 ring-black"
                    : "border-neutral-200 hover:border-border-emphasis hover:bg-neutral-50",
                )}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" fill="none" />
                </svg>
              </button>
            </Tooltip>
          </>
        )}
      </div>
    </div>
  );
}
