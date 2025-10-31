import { DotType } from "@/lib/qr/types";
import { DOT_TYPES } from "@/lib/qr/constants";
import { generatePath } from "@/lib/qr/utils";
import { Tooltip } from "@dub/ui";
import { cn } from "@dub/utils";

// Pattern preview using actual QR rendering functions
function PatternPreview({ pattern, color }: { pattern: DotType; color: string }) {
  const size = 32;

  // Create a small module grid with an S-pattern to demonstrate the pattern style
  // X X X
  // X
  //   X
  // X X X
  const modules: boolean[][] = [
    [true,  true,  true],
    [true,  false, false],
    [false, true,  false],
    [true,  true,  true],
  ];

  // Use the actual generatePath function from our QR rendering
  const path = generatePath(modules, 0, pattern);

  const viewBoxSize = 3;
  const viewBoxHeight = 4;
  const padding = 0.2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`${-padding} ${-padding} ${viewBoxSize + padding * 2} ${viewBoxHeight + padding * 2}`}
      fill="none"
      preserveAspectRatio="xMidYMid meet"
    >
      <path d={path} fill={color} />
    </svg>
  );
}

interface PatternSelectorProps {
  value: DotType;
  onChange: (pattern: DotType) => void;
  color: string;
  label?: string;
}

export function PatternSelector({
  value,
  onChange,
  color,
  label = "Dot Pattern",
}: PatternSelectorProps) {
  const patternLabels: Record<DotType, string> = {
    square: "Square",
    rounded: "Rounded",
    dots: "Dots",
    classy: "Classy",
    "extra-rounded": "Extra Rounded",
  };

  return (
    <div>
      <span className="block text-sm font-medium text-neutral-700">
        {label}
      </span>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {DOT_TYPES.map((pattern) => {
          const isSelected = value === pattern;
          return (
            <Tooltip
              key={pattern}
              content={patternLabels[pattern]}
            >
              <button
                type="button"
                aria-pressed={isSelected}
                aria-label={`Select ${patternLabels[pattern]} pattern`}
                onClick={() => onChange(pattern)}
                className={cn(
                  "flex size-12 items-center justify-center rounded-md border transition-all",
                  isSelected
                    ? "border-black bg-neutral-50 ring-1 ring-black"
                    : "border-neutral-200 hover:border-border-emphasis hover:bg-neutral-50",
                )}
              >
                <PatternPreview
                  pattern={pattern}
                  color={color}
                />
              </button>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
