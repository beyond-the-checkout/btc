/**
 * Eye pattern rendering for QR code position detection patterns
 *
 * Based on qr-code-styling by Denys Kozak
 * Repository: https://github.com/kozakdenys/qr-code-styling
 * License: MIT License
 */

import { EyePosition } from "./eye-detector";
import { CornerSquareType, CornerDotType } from "./constants";

// =============================================================================
// Corner Square (Outer 7x7 Frame) - SVG Path Generation
// =============================================================================

function generateSquareCornerSquarePath(
  eye: EyePosition,
  margin: number,
): string {
  const x = eye.x + margin;
  const y = eye.y + margin;
  const size = eye.size;

  // Draw outer border (7x7) with hollow center (leaving inner 5x5 hollow)
  return (
    `M${x},${y} h${size} v${size} h${-size} z ` +
    `M${x + 1},${y + 1} v${size - 2} h${size - 2} v${-(size - 2)} z`
  );
}

function generateRoundedCornerSquarePath(
  eye: EyePosition,
  margin: number,
): string {
  const x = eye.x + margin;
  const y = eye.y + margin;
  const size = eye.size;
  const r = 1.75; // Corner radius for outer corners
  const innerR = 1.75; // Corner radius for inner corners

  // Outer rounded rectangle
  const outer = `M${x + r},${y} ` +
    `L${x + size - r},${y} ` +
    `A${r},${r} 0 0 1 ${x + size},${y + r} ` +
    `L${x + size},${y + size - r} ` +
    `A${r},${r} 0 0 1 ${x + size - r},${y + size} ` +
    `L${x + r},${y + size} ` +
    `A${r},${r} 0 0 1 ${x},${y + size - r} ` +
    `L${x},${y + r} ` +
    `A${r},${r} 0 0 1 ${x + r},${y} z`;

  // Inner rounded rectangle (hollow)
  const inner = `M${x + 1 + innerR},${y + 1} ` +
    `L${x + size - 1 - innerR},${y + 1} ` +
    `A${innerR},${innerR} 0 0 1 ${x + size - 1},${y + 1 + innerR} ` +
    `L${x + size - 1},${y + size - 1 - innerR} ` +
    `A${innerR},${innerR} 0 0 1 ${x + size - 1 - innerR},${y + size - 1} ` +
    `L${x + 1 + innerR},${y + size - 1} ` +
    `A${innerR},${innerR} 0 0 1 ${x + 1},${y + size - 1 - innerR} ` +
    `L${x + 1},${y + 1 + innerR} ` +
    `A${innerR},${innerR} 0 0 1 ${x + 1 + innerR},${y + 1} z`;

  return outer + ' ' + inner;
}

function generateDotsCornerSquarePath(
  eye: EyePosition,
  margin: number,
): string {
  const x = eye.x + margin;
  const y = eye.y + margin;
  const size = eye.size;
  const cx = x + size / 2;
  const cy = y + size / 2;

  // Outer circle
  const outerR = size / 2;
  const outer = `M${cx - outerR},${cy} ` +
    `A${outerR},${outerR} 0 1 0 ${cx + outerR},${cy} ` +
    `A${outerR},${outerR} 0 1 0 ${cx - outerR},${cy} z`;

  // Inner circle (hollow)
  const innerR = (size - 2) / 2;
  const inner = `M${cx - innerR},${cy} ` +
    `A${innerR},${innerR} 0 1 0 ${cx + innerR},${cy} ` +
    `A${innerR},${innerR} 0 1 0 ${cx - innerR},${cy} z`;

  return outer + ' ' + inner;
}

function generateExtraRoundedCornerSquarePath(
  eye: EyePosition,
  margin: number,
): string {
  const x = eye.x + margin;
  const y = eye.y + margin;
  const size = eye.size;
  const r = size / 2; // Maximum rounding
  const innerR = (size - 2) / 2;

  // Outer rounded square (basically a circle)
  const outer = `M${x},${y + r} ` +
    `A${r},${r} 0 0 1 ${x + r},${y} ` +
    `L${x + size - r},${y} ` +
    `A${r},${r} 0 0 1 ${x + size},${y + r} ` +
    `L${x + size},${y + size - r} ` +
    `A${r},${r} 0 0 1 ${x + size - r},${y + size} ` +
    `L${x + r},${y + size} ` +
    `A${r},${r} 0 0 1 ${x},${y + size - r} z`;

  // Inner rounded square (hollow)
  const inner = `M${x + 1},${y + 1 + innerR} ` +
    `A${innerR},${innerR} 0 0 1 ${x + 1 + innerR},${y + 1} ` +
    `L${x + size - 1 - innerR},${y + 1} ` +
    `A${innerR},${innerR} 0 0 1 ${x + size - 1},${y + 1 + innerR} ` +
    `L${x + size - 1},${y + size - 1 - innerR} ` +
    `A${innerR},${innerR} 0 0 1 ${x + size - 1 - innerR},${y + size - 1} ` +
    `L${x + 1 + innerR},${y + size - 1} ` +
    `A${innerR},${innerR} 0 0 1 ${x + 1},${y + size - 1 - innerR} z`;

  return outer + ' ' + inner;
}

function generateLeafCornerSquarePath(
  eye: EyePosition,
  margin: number,
): string {
  const x = eye.x + margin;
  const y = eye.y + margin;
  const size = eye.size;

  // Leaf pattern with rounded top-left and bottom-right corners
  const r = size / 2;

  // Outer leaf shape
  const outer = `M${x + r},${y} ` +
    `L${x + size},${y} ` +
    `L${x + size},${y + r} ` +
    `A${r},${r} 0 0 1 ${x + size - r},${y + size} ` +
    `L${x},${y + size} ` +
    `L${x},${y + size - r} ` +
    `A${r},${r} 0 0 1 ${x + r},${y} z`;

  // Inner leaf shape (hollow) - scaled down by 1 unit
  const innerSize = size - 2;
  const innerR = innerSize / 2;
  const innerX = x + 1;
  const innerY = y + 1;

  const inner = `M${innerX + innerR},${innerY} ` +
    `L${innerX + innerSize},${innerY} ` +
    `L${innerX + innerSize},${innerY + innerR} ` +
    `A${innerR},${innerR} 0 0 1 ${innerX + innerSize - innerR},${innerY + innerSize} ` +
    `L${innerX},${innerY + innerSize} ` +
    `L${innerX},${innerY + innerSize - innerR} ` +
    `A${innerR},${innerR} 0 0 1 ${innerX + innerR},${innerY} z`;

  return outer + ' ' + inner;
}

export function generateCornerSquarePath(
  eye: EyePosition,
  type: CornerSquareType,
  margin: number,
): string {
  switch (type) {
    case "square":
      return generateSquareCornerSquarePath(eye, margin);
    case "rounded":
      return generateRoundedCornerSquarePath(eye, margin);
    case "dots":
      return generateDotsCornerSquarePath(eye, margin);
    case "extra-rounded":
      return generateExtraRoundedCornerSquarePath(eye, margin);
    case "leaf":
      return generateLeafCornerSquarePath(eye, margin);
    default:
      return generateSquareCornerSquarePath(eye, margin);
  }
}

// =============================================================================
// Corner Dot (Inner 3x3 Center) - SVG Path Generation
// =============================================================================

function generateSquareCornerDotPath(
  eye: EyePosition,
  margin: number,
): string {
  const x = eye.x + 2 + margin; // 2 units in from corner square
  const y = eye.y + 2 + margin;
  const size = 3;

  return `M${x},${y} h${size} v${size} h${-size} z`;
}

function generateDotsCornerDotPath(
  eye: EyePosition,
  margin: number,
): string {
  const cx = eye.x + 3.5 + margin; // Center of 3x3 area (2 + 1.5)
  const cy = eye.y + 3.5 + margin;
  const r = 1.5; // Radius for 3x3 circle

  return `M${cx - r},${cy} ` +
    `A${r},${r} 0 1 0 ${cx + r},${cy} ` +
    `A${r},${r} 0 1 0 ${cx - r},${cy} z`;
}

function generateRoundedCornerDotPath(
  eye: EyePosition,
  margin: number,
): string {
  const x = eye.x + 2 + margin;
  const y = eye.y + 2 + margin;
  const size = 3;
  const r = 0.75; // Corner radius for 3x3 rounded square

  return `M${x + r},${y} ` +
    `L${x + size - r},${y} ` +
    `A${r},${r} 0 0 1 ${x + size},${y + r} ` +
    `L${x + size},${y + size - r} ` +
    `A${r},${r} 0 0 1 ${x + size - r},${y + size} ` +
    `L${x + r},${y + size} ` +
    `A${r},${r} 0 0 1 ${x},${y + size - r} ` +
    `L${x},${y + r} ` +
    `A${r},${r} 0 0 1 ${x + r},${y} z`;
}

export function generateCornerDotPath(
  eye: EyePosition,
  type: CornerDotType,
  margin: number,
): string {
  switch (type) {
    case "square":
      return generateSquareCornerDotPath(eye, margin);
    case "dots":
      return generateDotsCornerDotPath(eye, margin);
    case "rounded":
      return generateRoundedCornerDotPath(eye, margin);
    default:
      return generateSquareCornerDotPath(eye, margin);
  }
}

// =============================================================================
// Corner Square (Outer 7x7 Frame) - Canvas Rendering
// =============================================================================

function drawSquareCornerSquareCanvas(
  ctx: CanvasRenderingContext2D,
  eye: EyePosition,
  margin: number,
): void {
  const x = eye.x + margin;
  const y = eye.y + margin;
  const size = eye.size;

  ctx.beginPath();
  // Outer border
  ctx.rect(x, y, size, size);
  // Inner hollow (counter-clockwise to create hole)
  ctx.rect(x + 1, y + 1, size - 2, size - 2);
  ctx.fill("evenodd");
}

function drawRoundedCornerSquareCanvas(
  ctx: CanvasRenderingContext2D,
  eye: EyePosition,
  margin: number,
): void {
  const x = eye.x + margin;
  const y = eye.y + margin;
  const size = eye.size;
  const r = 1.75;
  const innerR = 1.75;

  ctx.beginPath();
  // Outer rounded rectangle
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + size - r, y);
  ctx.arcTo(x + size, y, x + size, y + r, r);
  ctx.lineTo(x + size, y + size - r);
  ctx.arcTo(x + size, y + size, x + size - r, y + size, r);
  ctx.lineTo(x + r, y + size);
  ctx.arcTo(x, y + size, x, y + size - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();

  // Inner rounded rectangle (hollow)
  ctx.moveTo(x + 1 + innerR, y + 1);
  ctx.lineTo(x + size - 1 - innerR, y + 1);
  ctx.arcTo(x + size - 1, y + 1, x + size - 1, y + 1 + innerR, innerR);
  ctx.lineTo(x + size - 1, y + size - 1 - innerR);
  ctx.arcTo(x + size - 1, y + size - 1, x + size - 1 - innerR, y + size - 1, innerR);
  ctx.lineTo(x + 1 + innerR, y + size - 1);
  ctx.arcTo(x + 1, y + size - 1, x + 1, y + size - 1 - innerR, innerR);
  ctx.lineTo(x + 1, y + 1 + innerR);
  ctx.arcTo(x + 1, y + 1, x + 1 + innerR, y + 1, innerR);
  ctx.closePath();

  ctx.fill("evenodd");
}

function drawDotsCornerSquareCanvas(
  ctx: CanvasRenderingContext2D,
  eye: EyePosition,
  margin: number,
): void {
  const x = eye.x + margin;
  const y = eye.y + margin;
  const size = eye.size;
  const cx = x + size / 2;
  const cy = y + size / 2;

  ctx.beginPath();
  // Outer circle
  ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
  // Inner circle (counter-clockwise to create ring)
  ctx.arc(cx, cy, (size - 2) / 2, 0, Math.PI * 2, true);
  ctx.fill("evenodd");
}

function drawExtraRoundedCornerSquareCanvas(
  ctx: CanvasRenderingContext2D,
  eye: EyePosition,
  margin: number,
): void {
  const x = eye.x + margin;
  const y = eye.y + margin;
  const size = eye.size;
  const r = size / 2;
  const innerR = (size - 2) / 2;

  ctx.beginPath();
  // Outer rounded square
  ctx.moveTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.lineTo(x + size - r, y);
  ctx.arcTo(x + size, y, x + size, y + r, r);
  ctx.lineTo(x + size, y + size - r);
  ctx.arcTo(x + size, y + size, x + size - r, y + size, r);
  ctx.lineTo(x + r, y + size);
  ctx.arcTo(x, y + size, x, y + size - r, r);
  ctx.closePath();

  // Inner rounded square (hollow)
  ctx.moveTo(x + 1, y + 1 + innerR);
  ctx.arcTo(x + 1, y + 1, x + 1 + innerR, y + 1, innerR);
  ctx.lineTo(x + size - 1 - innerR, y + 1);
  ctx.arcTo(x + size - 1, y + 1, x + size - 1, y + 1 + innerR, innerR);
  ctx.lineTo(x + size - 1, y + size - 1 - innerR);
  ctx.arcTo(x + size - 1, y + size - 1, x + size - 1 - innerR, y + size - 1, innerR);
  ctx.lineTo(x + 1 + innerR, y + size - 1);
  ctx.arcTo(x + 1, y + size - 1, x + 1, y + size - 1 - innerR, innerR);
  ctx.closePath();

  ctx.fill("evenodd");
}

function drawLeafCornerSquareCanvas(
  ctx: CanvasRenderingContext2D,
  eye: EyePosition,
  margin: number,
): void {
  const x = eye.x + margin;
  const y = eye.y + margin;
  const size = eye.size;
  const r = size / 2;

  ctx.beginPath();
  // Outer leaf shape
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x + size, y + r);
  ctx.arcTo(x + size, y + size, x + size - r, y + size, r);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x, y + size - r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();

  // Inner leaf shape (hollow)
  const innerSize = size - 2;
  const innerR = innerSize / 2;
  const innerX = x + 1;
  const innerY = y + 1;

  ctx.moveTo(innerX + innerR, innerY);
  ctx.lineTo(innerX + innerSize, innerY);
  ctx.lineTo(innerX + innerSize, innerY + innerR);
  ctx.arcTo(innerX + innerSize, innerY + innerSize, innerX + innerSize - innerR, innerY + innerSize, innerR);
  ctx.lineTo(innerX, innerY + innerSize);
  ctx.lineTo(innerX, innerY + innerSize - innerR);
  ctx.arcTo(innerX, innerY, innerX + innerR, innerY, innerR);
  ctx.closePath();

  ctx.fill("evenodd");
}

export function drawCornerSquareCanvas(
  ctx: CanvasRenderingContext2D,
  eye: EyePosition,
  type: CornerSquareType,
  margin: number,
): void {
  switch (type) {
    case "square":
      drawSquareCornerSquareCanvas(ctx, eye, margin);
      break;
    case "rounded":
      drawRoundedCornerSquareCanvas(ctx, eye, margin);
      break;
    case "dots":
      drawDotsCornerSquareCanvas(ctx, eye, margin);
      break;
    case "extra-rounded":
      drawExtraRoundedCornerSquareCanvas(ctx, eye, margin);
      break;
    case "leaf":
      drawLeafCornerSquareCanvas(ctx, eye, margin);
      break;
    default:
      drawSquareCornerSquareCanvas(ctx, eye, margin);
  }
}

// =============================================================================
// Corner Dot (Inner 3x3 Center) - Canvas Rendering
// =============================================================================

function drawSquareCornerDotCanvas(
  ctx: CanvasRenderingContext2D,
  eye: EyePosition,
  margin: number,
): void {
  ctx.fillRect(eye.x + 2 + margin, eye.y + 2 + margin, 3, 3);
}

function drawDotsCornerDotCanvas(
  ctx: CanvasRenderingContext2D,
  eye: EyePosition,
  margin: number,
): void {
  const cx = eye.x + 3.5 + margin;
  const cy = eye.y + 3.5 + margin;
  const r = 1.5;

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawRoundedCornerDotCanvas(
  ctx: CanvasRenderingContext2D,
  eye: EyePosition,
  margin: number,
): void {
  const x = eye.x + 2 + margin;
  const y = eye.y + 2 + margin;
  const size = 3;
  const r = 0.75;

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + size - r, y);
  ctx.arcTo(x + size, y, x + size, y + r, r);
  ctx.lineTo(x + size, y + size - r);
  ctx.arcTo(x + size, y + size, x + size - r, y + size, r);
  ctx.lineTo(x + r, y + size);
  ctx.arcTo(x, y + size, x, y + size - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
  ctx.fill();
}

export function drawCornerDotCanvas(
  ctx: CanvasRenderingContext2D,
  eye: EyePosition,
  type: CornerDotType,
  margin: number,
): void {
  switch (type) {
    case "square":
      drawSquareCornerDotCanvas(ctx, eye, margin);
      break;
    case "dots":
      drawDotsCornerDotCanvas(ctx, eye, margin);
      break;
    case "rounded":
      drawRoundedCornerDotCanvas(ctx, eye, margin);
      break;
    default:
      drawSquareCornerDotCanvas(ctx, eye, margin);
  }
}
