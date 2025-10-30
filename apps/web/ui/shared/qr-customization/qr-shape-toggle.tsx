import { Tooltip, cn } from "@dub/ui";

interface QRShapeToggleProps {
  value: "square" | "circle";
  onChange: (shape: "square" | "circle") => void;
  label?: string;
}

export function QRShapeToggle({
  value,
  onChange,
  label = "QR Code Shape",
}: QRShapeToggleProps) {
  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-neutral-700">
        {label}
      </span>
      <div className="flex items-center gap-3">
        <Tooltip content="Square">
          <button
            type="button"
            aria-pressed={value === "square"}
            aria-label="Select square shape"
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
        <Tooltip content="Circle">
          <button
            type="button"
            aria-pressed={value === "circle"}
            aria-label="Select circle shape"
            onClick={() => onChange("circle")}
            className={cn(
              "flex size-12 items-center justify-center rounded-md border transition-all",
              value === "circle"
                ? "border-black bg-neutral-50 ring-1 ring-black"
                : "border-neutral-200 hover:border-border-emphasis hover:bg-neutral-50",
            )}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
