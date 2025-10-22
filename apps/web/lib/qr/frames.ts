import type { FrameOptions } from "./types";

/**
 * Frame rendering utilities for QR codes
 * Handles decorative borders and frames around QR codes
 */

export interface FrameRenderProps {
  frameOptions: FrameOptions;
  qrSize: number;
  margin: number;
}

/**
 * Calculate the total canvas size including frame
 */
export function getFrameSize(props: FrameRenderProps): number {
  const { frameOptions, qrSize, margin } = props;

  if (!frameOptions.type || frameOptions.type === "none") {
    return qrSize;
  }

  // Add padding for frame (20% of QR size on each side)
  const framePadding = Math.floor(qrSize * 0.2);
  return qrSize + framePadding * 2;
}

/**
 * Get frame padding amount
 * Returns frame-type-specific padding for proper spacing around the QR code
 */
export function getFramePadding(qrSize: number, frameType?: string): number {
  if (!frameType || frameType === "none") {
    return 0;
  }

  // Scale paddings relative to QR size so preview and exports match visually.
  // Calibrated so that at size=128px we match prior preview look:
  // - square/rounded-square ≈ 10px → ~0.078 ratio
  // - circle ≈ 22px → ~0.172 ratio (ensures corners don’t clip the circle)
  // - dots-circle ≈ 40px → ~0.3125 ratio
  const ratios: Record<string, number> = {
    square: 0.078,
    "rounded-square": 0.078,
    circle: 0.25,
    "dots-circle": 0.25,
  };
  const ratio = ratios[frameType] ?? 0.078;
  return Math.max(1, Math.round(qrSize * ratio));
}

/**
 * Render frame for canvas-based QR codes
 */
export function renderCanvasFrame(
  ctx: CanvasRenderingContext2D,
  props: FrameRenderProps,
): void {
  const { frameOptions, qrSize } = props;

  if (!frameOptions.type || frameOptions.type === "none") {
    return;
  }

  const padding = getFramePadding(qrSize, frameOptions.type);
  const totalSize = qrSize + padding * 2;
  const frameColor = frameOptions.color || "#000000";

  // Stroke width scales with QR size; ≈3px at size=128
  const borderWidth = Math.max(2, Math.round(qrSize * 0.023));

  ctx.save();

  switch (frameOptions.type) {
    case "square":
      renderSquareFrame(ctx, totalSize, borderWidth, frameColor);
      break;
    case "rounded-square": {
      const cornerRadius = Math.round(padding * 1.5);
      renderRoundedSquareFrame(ctx, totalSize, borderWidth, cornerRadius, frameColor);
      break;
    }
    case "circle":
      renderCircleFrame(ctx, totalSize, borderWidth, frameColor);
      break;
    case "dots-circle":
      renderDotsCircleFrame(ctx, totalSize, frameColor, qrSize);
      break;
  }

  // Render text if provided
  if (frameOptions.text) {
    renderFrameText(ctx, totalSize, frameOptions);
  }

  ctx.restore();
}

/**
 * Render SVG frame elements
 */
export function renderSVGFrame(props: FrameRenderProps): string {
  const { frameOptions, qrSize } = props;

  if (!frameOptions.type || frameOptions.type === "none") {
    return "";
  }

  const padding = getFramePadding(qrSize, frameOptions.type);
  const totalSize = qrSize + padding * 2;
  const frameColor = frameOptions.color || "#000000";

  // Stroke width scales similar to canvas; ≈3px at size=128
  const borderWidth = Math.max(2, Math.round(qrSize * 0.023));

  let framePath = "";

  switch (frameOptions.type) {
    case "square":
      framePath = getSVGSquareFrame(totalSize, borderWidth, frameColor);
      break;
    case "rounded-square": {
      const radius = Math.round(padding * 1.5);
      framePath = getSVGRoundedSquareFrame(totalSize, borderWidth, radius, frameColor);
      break;
    }
    case "circle":
      framePath = getSVGCircleFrame(totalSize, borderWidth, frameColor);
      break;
    case "dots-circle":
      framePath = getSVGDotsCircleFrame(totalSize, qrSize, frameColor);
      break;
  }

  // Add text if provided
  if (frameOptions.text) {
    framePath += getSVGFrameText(totalSize, frameOptions);
  }

  return framePath;
}

// Canvas frame rendering helpers

function renderSquareFrame(
  ctx: CanvasRenderingContext2D,
  totalSize: number,
  borderWidth: number,
  color: string,
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = borderWidth;
  ctx.strokeRect(
    borderWidth / 2,
    borderWidth / 2,
    totalSize - borderWidth,
    totalSize - borderWidth,
  );
}

function renderRoundedSquareFrame(
  ctx: CanvasRenderingContext2D,
  totalSize: number,
  borderWidth: number,
  radius: number,
  color: string,
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = borderWidth;
  ctx.beginPath();
  ctx.roundRect(
    borderWidth / 2,
    borderWidth / 2,
    totalSize - borderWidth,
    totalSize - borderWidth,
    radius,
  );
  ctx.stroke();
}

function renderCircleFrame(
  ctx: CanvasRenderingContext2D,
  totalSize: number,
  borderWidth: number,
  color: string,
): void {
const rScale = 0.9; // increase from 0.85 by 10% (i.e., +10% over current)
  const radius = ((totalSize - borderWidth) / 2) * rScale;

  ctx.strokeStyle = color;
  ctx.lineWidth = borderWidth;
  ctx.beginPath();
  ctx.arc(totalSize / 2, totalSize / 2, radius, 0, Math.PI * 2);
  ctx.stroke();
}

function renderDotsCircleFrame(
  ctx: CanvasRenderingContext2D,
  totalSize: number,
  color: string,
  qrSize: number,
): void {
  // Scale dot radius relative to QR size; ≈2px at size=128
  const dotRadius = Math.max(1, Math.round(qrSize * 0.015625));
  const dotCount = 48;
  // Match the circle frame outer extent: center radius equals circle center radius adjusted for dot size vs stroke
  const borderWidth = Math.max(2, Math.round(qrSize * 0.023));
const rScale = 0.9; // increase from 0.85 by 10% (i.e., +10% over current)
  const circleCenterRadius = ((totalSize - borderWidth) / 2) * rScale;
  const radius = circleCenterRadius - (dotRadius - borderWidth / 2);

  ctx.fillStyle = color;

  for (let i = 0; i < dotCount; i++) {
    const angle = (i / dotCount) * Math.PI * 2;
    const x = totalSize / 2 + Math.cos(angle) * radius;
    const y = totalSize / 2 + Math.sin(angle) * radius;

    ctx.beginPath();
    ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderFrameText(
  ctx: CanvasRenderingContext2D,
  totalSize: number,
  frameOptions: FrameOptions,
): void {
  const fontSize = frameOptions.textSize || 16;
  const textColor = frameOptions.textColor || "#000000";

  ctx.fillStyle = textColor;
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  const textY = totalSize - fontSize - 10;
  ctx.fillText(frameOptions.text || "", totalSize / 2, textY);
}

// SVG frame rendering helpers

function getSVGSquareFrame(
  totalSize: number,
  borderWidth: number,
  color: string,
): string {
  return `<rect x="${borderWidth / 2}" y="${borderWidth / 2}" width="${totalSize - borderWidth}" height="${totalSize - borderWidth}" fill="none" stroke="${color}" stroke-width="${borderWidth}" />`;
}

function getSVGRoundedSquareFrame(
  totalSize: number,
  borderWidth: number,
  radius: number,
  color: string,
): string {
  return `<rect x="${borderWidth / 2}" y="${borderWidth / 2}" width="${totalSize - borderWidth}" height="${totalSize - borderWidth}" rx="${radius}" ry="${radius}" fill="none" stroke="${color}" stroke-width="${borderWidth}" />`;
}

function getSVGCircleFrame(
  totalSize: number,
  borderWidth: number,
  color: string,
): string {
const rScale = 0.9; // increase from 0.85 by 10% (i.e., +10% over current)
  const radius = ((totalSize - borderWidth) / 2) * rScale;

  return `<circle cx="${totalSize / 2}" cy="${totalSize / 2}" r="${radius}" fill="none" stroke="${color}" stroke-width="${borderWidth}" />`;
}

function getSVGDotsCircleFrame(
  totalSize: number,
  qrSize: number,
  color: string,
): string {
  const dotRadius = Math.max(1, Math.round(qrSize * 0.015625));
  const dotCount = 48;
  const borderWidth = Math.max(2, Math.round(qrSize * 0.023));
const rScale = 0.9; // increase from 0.85 by 10% (i.e., +10% over current)
  const circleCenterRadius = ((totalSize - borderWidth) / 2) * rScale;
  const radius = circleCenterRadius - (dotRadius - borderWidth / 2);

  let dots = "";

  for (let i = 0; i < dotCount; i++) {
    const angle = (i / dotCount) * Math.PI * 2;
    const x = totalSize / 2 + Math.cos(angle) * radius;
    const y = totalSize / 2 + Math.sin(angle) * radius;

    dots += `<circle cx="${x}" cy="${y}" r="${dotRadius}" fill="${color}" />`;
  }

  return dots;
}

function getSVGFrameText(totalSize: number, frameOptions: FrameOptions): string {
  const fontSize = frameOptions.textSize || 16;
  const textColor = frameOptions.textColor || "#000000";
  const textY = totalSize - fontSize - 10;

  return `<text x="${totalSize / 2}" y="${textY}" font-size="${fontSize}" fill="${textColor}" text-anchor="middle" font-family="sans-serif">${frameOptions.text || ""}</text>`;
}
