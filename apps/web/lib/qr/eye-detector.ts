import { Modules } from "./types";

export type EyePosition = {
  x: number;
  y: number;
  size: number;
  corner: "top-left" | "top-right" | "bottom-left";
};

export function detectEyes(modules: Modules): EyePosition[] {
  const moduleCount = modules.length;
  const eyeSize = 7;

  return [
    { x: 0, y: 0, size: eyeSize, corner: "top-left" },
    { x: moduleCount - eyeSize, y: 0, size: eyeSize, corner: "top-right" },
    { x: 0, y: moduleCount - eyeSize, size: eyeSize, corner: "bottom-left" }
  ];
}

export function isInEye(x: number, y: number, eyes: EyePosition[]): boolean {
  return eyes.some(eye =>
    x >= eye.x && x < eye.x + eye.size &&
    y >= eye.y && y < eye.y + eye.size
  );
}

export function getEyeRegion(
  x: number, y: number, eye: EyePosition
): "outer" | "middle" | "inner" | null {
  const relX = x - eye.x;
  const relY = y - eye.y;

  if (relX < 0 || relX >= eye.size || relY < 0 || relY >= eye.size) {
    return null;
  }

  // Inner 3x3 center
  if (relX >= 2 && relX <= 4 && relY >= 2 && relY <= 4) {
    return "inner";
  }

  // Outer border
  if (relX === 0 || relX === 6 || relY === 0 || relY === 6) {
    return "outer";
  }

  return "middle"; // White ring
}
