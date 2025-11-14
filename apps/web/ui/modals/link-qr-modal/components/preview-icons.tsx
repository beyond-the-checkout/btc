import type { DotType } from "@/lib/qr";
import type { CornerDotType, CornerSquareType } from "@/lib/qr/constants";
import { generateCornerDotPath, generateCornerSquarePath } from "@/lib/qr/eye-patterns";
import { generatePath } from "@/lib/qr/utils";

// Pattern preview using actual QR rendering functions
export function PatternPreview({
  pattern,
  color,
}: {
  pattern: DotType;
  color: string;
}) {
  const size = 32;

  // Create a small module grid with an S-pattern to demonstrate the pattern style
  // X X X
  // X
  //   X
  // X X X
  const modules: boolean[][] = [
    [true, true, true],
    [true, false, false],
    [false, true, false],
    [true, true, true],
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

// Corner Square preview (7x7 outer frame)
export function CornerSquarePreview({
  type,
  color,
}: {
  type: CornerSquareType;
  color: string;
}) {
  const size = 32;
  const eyeSize = 7;

  // Mock eye position for preview - use the actual path generation function
  const eye = { x: 0, y: 0, size: eyeSize, corner: "top-left" as const };
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
      <path
        d={path}
        fill={color}
        fillRule="evenodd"
        shapeRendering="crispEdges"
      />
    </svg>
  );
}

// Corner Dot preview (3x3 inner dot)
export function CornerDotPreview({
  type,
  color,
}: {
  type: CornerDotType;
  color: string;
}) {
  const size = 32;
  const eyeSize = 7;

  // Mock eye position for preview - use the actual path generation function
  const eye = { x: 0, y: 0, size: eyeSize, corner: "top-left" as const };
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