import { CornerSquareType, CornerDotType } from "@/lib/qr/constants";
import { CORNER_SQUARE_TYPES, CORNER_DOT_TYPES } from "@/lib/qr/constants";
import { generateCornerSquarePath, generateCornerDotPath } from "@/lib/qr/eye-patterns";
import { Tooltip, cn } from "@dub/ui";

// Corner Square preview (7x7 outer frame)
function CornerSquarePreview({ type, color }: { type: CornerSquareType; color: string }) {
  const size = 32;
  const eyeSize = 7;

  // Mock eye position for preview - use the actual path generation function
  const eye = { x: 0, y: 0, size: eyeSize };
  const margin = 0;

  // Use the actual generateCornerSquarePath function
  const path = generateCornerSquarePath(eye, type, margin);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`-0.5 -0.5 ${eyeSize + 1} ${eyeSize + 1}`}
      fill="none"
      preserveAspectRatio="xMidYMid meet"
    >
      <path d={path} fill={color} fillRule="evenodd" shapeRendering="crispEdges" />
    </svg>
  );
}

// Corner Dot preview (3x3 inner dot)
function CornerDotPreview({ type, color }: { type: CornerDotType; color: string }) {
  const size = 32;
  const eyeSize = 7;

  // Mock eye position for preview - use the actual path generation function
  const eye = { x: 0, y: 0, size: eyeSize };
  const margin = 0;

  // Use the actual generateCornerDotPath function
  const path = generateCornerDotPath(eye, type, margin);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`-0.5 -0.5 ${eyeSize + 1} ${eyeSize + 1}`}
      fill="none"
      preserveAspectRatio="xMidYMid meet"
    >
      <path d={path} fill={color} />
    </svg>
  );
}

interface CornerSelectorProps {
  cornerSquareType: CornerSquareType;
  cornerDotType: CornerDotType;
  onCornerSquareChange: (type: CornerSquareType) => void;
  onCornerDotChange: (type: CornerDotType) => void;
  color: string;
  label?: string;
}

export function CornerSelector({
  cornerSquareType,
  cornerDotType,
  onCornerSquareChange,
  onCornerDotChange,
  color,
  label = "Corner Eyes",
}: CornerSelectorProps) {
  const squareTypeLabels: Record<CornerSquareType, string> = {
    square: "Square",
    rounded: "Rounded",
    dots: "Circle",
    "extra-rounded": "Extra Rounded",
    leaf: "Leaf",
  };

  const dotTypeLabels: Record<CornerDotType, string> = {
    square: "Square",
    dots: "Circle",
    rounded: "Rounded",
  };

  return (
    <div>
      <span className="block text-sm font-medium text-neutral-700">
        {label}
      </span>
      <div className="mt-3 space-y-3">
        {/* Outer Frame (Corner Square) */}
        <div>
          <label className="mb-2 block text-xs font-medium text-neutral-600">
            Outer Frame
          </label>
          <div className="flex flex-wrap items-center gap-3">
            {CORNER_SQUARE_TYPES.map((type) => {
              const isSelected = cornerSquareType === type;
              return (
                <Tooltip
                  key={type}
                  content={squareTypeLabels[type]}
                >
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={`Select ${squareTypeLabels[type]} outer frame`}
                    onClick={() => onCornerSquareChange(type)}
                    className={cn(
                      "flex size-12 items-center justify-center rounded-md border transition-all",
                      isSelected
                        ? "border-black bg-neutral-50 ring-1 ring-black"
                        : "border-neutral-200 hover:border-border-emphasis hover:bg-neutral-50",
                    )}
                  >
                    <CornerSquarePreview
                      type={type}
                      color={color}
                    />
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
              const isSelected = cornerDotType === type;
              return (
                <Tooltip
                  key={type}
                  content={dotTypeLabels[type]}
                >
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={`Select ${dotTypeLabels[type]} inner dot`}
                    onClick={() => onCornerDotChange(type)}
                    className={cn(
                      "flex size-12 items-center justify-center rounded-md border transition-all",
                      isSelected
                        ? "border-black bg-neutral-50 ring-1 ring-black"
                        : "border-neutral-200 hover:border-border-emphasis hover:bg-neutral-50",
                    )}
                  >
                    <CornerDotPreview
                      type={type}
                      color={color}
                    />
                  </button>
                </Tooltip>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
