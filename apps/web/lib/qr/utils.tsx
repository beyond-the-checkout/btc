import qrcodegen from "./codegen";
import {
  DEFAULT_BGCOLOR,
  DEFAULT_DOT_TYPE,
  DEFAULT_FGCOLOR,
  DEFAULT_IMG_SCALE,
  DEFAULT_LEVEL,
  DEFAULT_MARGIN,
  DEFAULT_SIZE,
  ERROR_LEVEL_MAP,
  DEFAULT_CORNER_SQUARE_TYPE,
  DEFAULT_CORNER_DOT_TYPE,
  DEFAULT_FRAME_TYPE,
} from "./constants";
import { DotType, Excavation, GetNeighbor, ImageSettings, Modules, QRPropsSVG } from "./types";
import { detectEyes, isInEye } from "./eye-detector";
import { generateCornerSquarePath, generateCornerDotPath } from "./eye-patterns";
import { getFramePadding, renderSVGFrame } from "./frames";

import type { JSX } from "react";

// ---------------------------------------------
// Circular border dot placement helpers (shared)
// ---------------------------------------------

// Mode: 'pattern' uses a predefined band rotated per side, 'random' keeps noise approach
const BORDER_PATTERN_MODE: 'pattern' | 'random' = 'pattern';

// Tangent-wise thickness profile (cells from inner edge) — rotated to each side
// Values emphasize 1–3 cell thickness, with occasional 4 for variety. Length should be >= 32.
const BORDER_PATTERN_THICKNESS: number[] = [
  2,1,2,1,3,2,1,1, 2,1,1,2, 3,2,1,1,
  2,1,2,1,1,2,3,2, 1,1,2,1, 3,2,1,1,
  2,1,1,2, 3,2,1,1, 2,1,3,2, 1,1,2,1,
];

// Radial masks (from inner edge → circle) used to cover the entire width
// 1 = dot, 0 = gap. Designed with mixed segment lengths to resemble the screenshot.
const BORDER_PATTERN_MASKS: number[][] = [
  // mask length must be the same across entries
  [1,1,1,0, 1,1,0,1,  1,0,1,1,  0,1,0,1],
  [1,1,0,1,  1,0,1,1,  0,1,1,0,  1,0,1,0],
  [1,0,1,1,  1,1,0,0,  1,0,1,0,  1,1,0,1],
  [1,1,0,0,  1,1,1,0,  1,0,1,0,  1,0,1,1],
  [1,0,1,0,  1,1,0,1,  1,0,1,1,  0,1,1,0],
  [1,1,1,0,  1,0,1,0,  1,1,0,1,  0,1,0,1],
];
const BORDER_PATTERN_MASK_LEN = BORDER_PATTERN_MASKS[0].length;

function getPatternMaskForU(u: number): number[] {
  const idx = Math.floor(u * BORDER_PATTERN_MASKS.length) % BORDER_PATTERN_MASKS.length;
  return BORDER_PATTERN_MASKS[idx];
}

function angleWrap(a: number): number {
  // Wrap to [-PI, PI]
  while (a <= -Math.PI) a += 2 * Math.PI;
  while (a > Math.PI) a -= 2 * Math.PI;
  return a;
}

function getSideIndexForAngle(theta: number): number {
  // Side centers: right(0), top(1), left(2), bottom(3)
  const centers = [0, -Math.PI / 2, Math.PI, Math.PI / 2];
  let best = 0;
  let bestDiff = Infinity;
  for (let i = 0; i < 4; i++) {
    const d = Math.abs(angleWrap(theta - centers[i]));
    if (d < bestDiff) {
      bestDiff = d;
      best = i;
    }
  }
  return best;
}

function getPatternThicknessForCoord(
  dx: number,
  dy: number,
  circleRadius: number,
  sideIndex: number,
): number {
  // Rotate (dx,dy) so that the side's tangent is aligned with +Y
  const centers = [0, -Math.PI / 2, Math.PI, Math.PI / 2];
  const rot = -centers[sideIndex];
  const cosr = Math.cos(rot);
  const sinr = Math.sin(rot);
  const ry = dx * sinr + dy * cosr; // tangent axis

  // Normalize tangent coordinate across full diameter, map to [0,1]
  const u = Math.max(0, Math.min(1, 0.5 + ry / (2 * circleRadius)));
  const idx = Math.floor(u * BORDER_PATTERN_THICKNESS.length) % BORDER_PATTERN_THICKNESS.length;
  return Math.max(1, BORDER_PATTERN_THICKNESS[idx]);
}

// Simple deterministic 2D hash → [0,1)
function hash2D(x: number, y: number, seed = 1337): number {
  // Mix coordinates and seed into 32-bit space
  let h = (Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ (seed | 0)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 0xffffffff;
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function getCircularBorderParams(numCells: number, margin: number) {
  const center = numCells / 2;
  const qrRadius = (numCells - margin * 2) / 2;
  const qrDiagonalRadius = qrRadius * Math.sqrt(2);
  const circleRadius = qrDiagonalRadius * 1.15; // matches all renderers

  const dotSize = 0.9; // Slightly smaller than 1 for spacing
  const dotRadius = dotSize / 2;

  const gridSize = Math.ceil(circleRadius * 2) + 1;
  const gridOffset = (gridSize - numCells) / 2;

  return { center, qrRadius, qrDiagonalRadius, circleRadius, dotSize, dotRadius, gridSize, gridOffset };
}

// Decide if a decorative dot should be placed at grid cell (x,y)
// Adds semi-randomness and density falloff from inner boundary → outer circle.
export function shouldPlaceCircularBorderDot(
  x: number,
  y: number,
  params: ReturnType<typeof getCircularBorderParams>,
): boolean {
  const { center, gridOffset, qrRadius, qrDiagonalRadius, circleRadius } = params;

  // Convert grid index to QR-space coords (centered)
  const dx = x + 0.5 - center - gridOffset;
  const dy = y + 0.5 - center - gridOffset;

  const r = Math.hypot(dx, dy);
  const maxAxisDistance = Math.max(Math.abs(dx), Math.abs(dy));

  const isOutsideSquare = maxAxisDistance > qrRadius;
  const isInsideCircle = r < circleRadius;
  if (!(isOutsideSquare && isInsideCircle)) return false;

  if (BORDER_PATTERN_MODE === 'pattern') {
    // Pattern-based radial occupancy from inner edge → circle, rotated per side
    const theta = Math.atan2(dy, dx);
    const side = getSideIndexForAngle(theta);

    // Tangent coord normalized across the diameter
    const centers = [0, -Math.PI / 2, Math.PI, Math.PI / 2];
    const rot = -centers[side];
    const cosr = Math.cos(rot);
    const sinr = Math.sin(rot);
    const ry = dx * sinr + dy * cosr; // tangent axis
    const u = clamp01(0.5 + ry / (2 * circleRadius));

    // Radial normalization: 0 at square edge, 1 at circle boundary for this angle
    const absCos = Math.abs(Math.cos(theta));
    const absSin = Math.abs(Math.sin(theta));
    const rMin = qrRadius / Math.max(absCos || 1e-6, absSin || 1e-6);
    const rhoNorm = clamp01((r - rMin) / Math.max(1e-6, (circleRadius - rMin)));

    // Select a mask for this tangent position and blend across indices to soften bands
    const mask = getPatternMaskForU(u);
    const f = rhoNorm * BORDER_PATTERN_MASK_LEN;
    const i0 = Math.min(BORDER_PATTERN_MASK_LEN - 1, Math.max(0, Math.floor(f)));
    const i1 = Math.min(BORDER_PATTERN_MASK_LEN - 1, i0 + 1);
    const w = f - Math.floor(f);

    // Base probability from mask values (softer than hard 0/1)
    const v0 = mask[i0] ? 0.78 : 0.12;
    const v1 = mask[i1] ? 0.78 : 0.12;
    let p = v0 * (1 - w) + v1 * w;

    // Coarse angular/radial noise to break repetition
    const ringBin = Math.floor(rhoNorm * 12) | 0;
    const angleBin = Math.floor(((theta + Math.PI) / (2 * Math.PI)) * 16) | 0;
    const coarse = hash2D(angleBin, ringBin, 901845);
    p *= 1 + (coarse - 0.5) * 0.35; // ±17.5%

    // Fine bias to dither edges
    p += (hash2D(x, y, 131071) - 0.5) * 0.08; // ±0.04

    // Near-edge attenuation to avoid a solid-looking border
    if (rhoNorm <= 0.10) {
      const k = rhoNorm / 0.10; // 0 at edge -> 1 at 10% of ring
      const atten = 0.6 + 0.4 * k; // 0.6 at edge, ramps to 1.0 by 10%
      p *= atten;
      // Sparse micro-boost to keep occasional contacts (no white halo)
      if (rhoNorm <= 0.025 && ((x + y) & 3) === 0) {
        p += 0.12;
      }
      // Minimum near-edge coverage to eliminate visible white ring in high-res PNG
      if (rhoNorm <= 0.03) {
        p = Math.max(p, 0.82);
      } else if (rhoNorm <= 0.08) {
        const u3 = (rhoNorm - 0.03) / 0.05; // 0..1
        p = Math.max(p, 0.82 - 0.35 * u3);
      }
    }

    // Outer-edge support: avoid a visible white ring near the frame in high-res exports
    if (rhoNorm >= 0.92) {
      const uo = (rhoNorm - 0.92) / 0.08; // 0..1 last 8% of ring
      p = Math.max(p, 0.25 + 0.35 * uo); // rises to ~0.6 at the boundary
    }

    // Final stochastic decision
    p = clamp01(p);
    const final = hash2D(x ^ 0x9e37, y ^ 0x79b9, 1337);
    return final < p;
  }

  // Random mode (fallback) — currently unused when pattern is enabled
  const tRadial = clamp01((r - qrDiagonalRadius) / (circleRadius - qrDiagonalRadius));
  const tAxis = clamp01((maxAxisDistance - qrRadius) / (circleRadius - qrRadius));
  let t = clamp01(0.6 * tRadial + 0.4 * tAxis);
  t = Math.pow(t, 1.5);
  let p = lerp(0.60, 0.08, t);
  const edgeDelta = maxAxisDistance - qrRadius;
  let minEdgeP = 0;
  if (edgeDelta <= 0.10) {
    minEdgeP = 0.85;
  } else if (edgeDelta <= 0.25) {
    const u = (edgeDelta - 0.10) / 0.15;
    minEdgeP = lerp(0.85, 0.55, u);
  }
  p = Math.max(p, minEdgeP);
  const coarse = hash2D((x / 3) | 0, (y / 3) | 0, 915488749);
  const ringBin = Math.max(0, Math.min(9, Math.floor(tRadial * 10)));
  const ringNoise = hash2D(ringBin, 99991, 424242);
  const theta = Math.atan2(dy, dx);
  const angleBin = Math.floor(((theta + Math.PI) / (2 * Math.PI)) * 8) | 0;
  const angleNoise = hash2D(angleBin, ringBin, 777);
  let s = 1;
  s *= 1 + (coarse - 0.5) * 0.6;
  s *= 1 + (ringNoise - 0.5) * 0.3;
  s *= 1 + (angleNoise - 0.5) * 0.25;
  p *= s;
  p *= 0.60;
  p = Math.max(p, minEdgeP);
  const fine = hash2D(x, y, 1337);
  p = clamp01(p);
  return fine < p;
}


// Helper function to create a neighbor checker for a specific module position
export function getBorderDotSizeAt(
  x: number,
  y: number,
  params: ReturnType<typeof getCircularBorderParams>,
): number {
  const { center, gridOffset, qrRadius, qrDiagonalRadius, circleRadius, dotSize } = params;
  const dx = x + 0.5 - center - gridOffset;
  const dy = y + 0.5 - center - gridOffset;
  const r = Math.hypot(dx, dy);
  const maxAxisDistance = Math.max(Math.abs(dx), Math.abs(dy));

  // Same blend as probability, but use a gentler curve for size
  const tRadial = clamp01((r - qrDiagonalRadius) / (circleRadius - qrDiagonalRadius));
  const tAxis = clamp01((maxAxisDistance - qrRadius) / (circleRadius - qrRadius));
  let t = clamp01(0.6 * tRadial + 0.4 * tAxis);
  t = Math.pow(t, 0.8);

  // Slightly larger near inner edge to eliminate thin gaps
  const maxSize = 1.04; // up to 4% larger than a cell near edge
  const minSize = dotSize; // default far from core
  const size = lerp(maxSize, minSize, t);
  return Math.max(0.01, size);
}

export function createGetNeighbor(modules: Modules, x: number, y: number): GetNeighbor {
  return (dx: number, dy: number): boolean => {
    const newX = x + dx;
    const newY = y + dy;
    if (newY < 0 || newY >= modules.length) return false;
    if (newX < 0 || newX >= modules[newY].length) return false;
    return modules[newY][newX];
  };
}

// We could just do this in generatePath, except that we want to support
// non-Path2D canvas, so we need to keep it an explicit step.
export function excavateModules(
  modules: Modules,
  excavation: Excavation,
): Modules {
  return modules.slice().map((row, y) => {
    if (y < excavation.y || y >= excavation.y + excavation.h) {
      return row;
    }
    return row.map((cell, x) => {
      if (x < excavation.x || x >= excavation.x + excavation.w) {
        return cell;
      }
      return false;
    });
  });
}

// Helper functions for generating different dot patterns
function generateSquarePath(x: number, y: number, margin: number): string {
  return `M${x + margin},${y + margin} h1v1H${x + margin}z`;
}

function generateRoundedPath(x: number, y: number, margin: number): string {
  const mx = x + margin;
  const my = y + margin;
  const r = 0.25; // Corner radius
  // Rounded rectangle using arc commands
  return `M${mx + r},${my} h${1 - 2 * r} a${r},${r} 0 0 1 ${r},${r} v${1 - 2 * r} a${r},${r} 0 0 1 ${-r},${r} h${-(1 - 2 * r)} a${r},${r} 0 0 1 ${-r},${-r} v${-(1 - 2 * r)} a${r},${r} 0 0 1 ${r},${-r}z`;
}

function generateDotsPath(x: number, y: number, margin: number): string {
  const cx = x + margin + 0.5;
  const cy = y + margin + 0.5;
  const r = 0.45; // Circle radius (slightly smaller than square to maintain same visual weight)
  // Circle using arc commands (two semicircles)
  return `M${cx - r},${cy} a${r},${r} 0 1 0 ${r * 2},0 a${r},${r} 0 1 0 ${-r * 2},0z`;
}

function generateClassyPath(x: number, y: number, margin: number): string {
  const mx = x + margin;
  const my = y + margin;
  const r = 0.4; // Larger corner radius for classy look
  // More pronounced rounded corners
  return `M${mx + r},${my} h${1 - 2 * r} a${r},${r} 0 0 1 ${r},${r} v${1 - 2 * r} a${r},${r} 0 0 1 ${-r},${r} h${-(1 - 2 * r)} a${r},${r} 0 0 1 ${-r},${-r} v${-(1 - 2 * r)} a${r},${r} 0 0 1 ${r},${-r}z`;
}

function generateExtraRoundedPath(x: number, y: number, margin: number): string {
  const cx = x + margin + 0.5;
  const cy = y + margin + 0.5;
  const r = 0.5; // Maximum rounding (creates a circle)
  // Full circle
  return `M${cx - r},${cy} a${r},${r} 0 1 0 ${r * 2},0 a${r},${r} 0 1 0 ${-r * 2},0z`;
}

// ============================================================================
// Neighbor-aware shape generation functions
//
// Based on qr-code-styling by Denys Kozak
// Repository: https://github.com/kozakdenys/qr-code-styling
// License: MIT License
//
// Copyright (c) 2019 Denys Kozak
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//
// The following functions implement neighbor-aware QR dot rendering where
// shapes adapt based on adjacent modules to create seamless connections
// while maintaining QR code scannability.
// ============================================================================

/**
 * Generates a side-rounded shape where one side is rounded based on neighbor position.
 * When a module has exactly 1 neighbor, the side facing AWAY from the neighbor is rounded,
 * while the side touching the neighbor remains square to avoid gaps.
 *
 * @param x - Module x coordinate
 * @param y - Module y coordinate
 * @param margin - Margin offset
 * @param neighborSide - Which side has the neighbor: 'left' | 'right' | 'top' | 'bottom'
 *
 * Based on _basicSideRounded from qr-code-styling
 */
function generateSideRoundedPath(
  x: number,
  y: number,
  margin: number,
  neighborSide: 'left' | 'right' | 'top' | 'bottom'
): string {
  const mx = x + margin;
  const my = y + margin;
  const size = 1;
  const r = size / 2; // Half the size for semicircle

  // Generate path based on which side has the neighbor
  // The OPPOSITE side from the neighbor gets rounded
  switch (neighborSide) {
    case 'left': // Neighbor on left, round the right side
      return `M${mx},${my} v${size} h${size / 2} a${r},${r} 0 0 0 0,${-size} z`;
    case 'right': // Neighbor on right, round the left side
      return `M${mx + size},${my} v${size} h${-size / 2} a${r},${r} 0 0 1 0,${-size} z`;
    case 'top': // Neighbor on top, round the bottom side
      return `M${mx},${my} h${size} v${size / 2} a${r},${r} 0 0 1 ${-size},0 z`;
    case 'bottom': // Neighbor on bottom, round the top side
      return `M${mx},${my + size} h${size} v${-size / 2} a${r},${r} 0 0 0 ${-size},0 z`;
  }
}

/**
 * Generates a corner-rounded shape matching qr-code-styling reference rotation logic.
 *
 * Reference implementation (_drawRounded, _drawExtraRounded) generates one base path
 * and rotates it via SVG transform. We generate mathematically equivalent rotated paths.
 *
 * @param x - Module x coordinate
 * @param y - Module y coordinate
 * @param margin - Margin offset
 * @param corner - Which corner to round based on neighbor detection
 * @param extraRounded - Use extra-rounded variant (larger arc, different path structure)
 *
 * Based on _basicCornerRounded and _basicCornerExtraRounded from qr-code-styling
 * https://github.com/kozakdenys/qr-code-styling/blob/master/src/figures/dot/QRDot.ts
 */
function generateCornerRoundedPath(
  x: number,
  y: number,
  margin: number,
  corner: 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left',
  extraRounded: boolean = false
): string {
  const mx = x + margin;
  const my = y + margin;
  const size = 1;
  const r = extraRounded ? size : size / 2;

  // Generate SVG paths using arc commands (A) to match Canvas arcTo behavior
  // SVG arc: A rx ry x-axis-rotation large-arc-flag sweep-flag x y

  switch (corner) {
    case 'top-left':
      // Square with top-left corner rounded
      // Start at left edge (below rounded corner)
      return `M${mx},${my + r} A${r},${r} 0 0 1 ${mx + r},${my} L${mx + size},${my} L${mx + size},${my + size} L${mx},${my + size} z`;

    case 'top-right':
      // Square with top-right corner rounded
      // Start at top-left corner
      return `M${mx},${my} L${mx + size - r},${my} A${r},${r} 0 0 1 ${mx + size},${my + r} L${mx + size},${my + size} L${mx},${my + size} z`;

    case 'bottom-right':
      // Square with bottom-right corner rounded
      // Start at top-left corner
      return `M${mx},${my} L${mx + size},${my} L${mx + size},${my + size - r} A${r},${r} 0 0 1 ${mx + size - r},${my + size} L${mx},${my + size} z`;

    case 'bottom-left':
      // Square with bottom-left corner rounded
      // Start at top edge (right of top-left)
      return `M${mx + r},${my} L${mx + size},${my} L${mx + size},${my + size} L${mx + r},${my + size} A${r},${r} 0 0 1 ${mx},${my + size - r} L${mx},${my} z`;
  }
}

/**
 * Generates a corners-rounded shape for isolated modules (0 neighbors).
 * Rounds only TWO diagonal corners (bottom-left and top-right) with large arcs.
 *
 * Based on _basicCornersRounded from qr-code-styling
 * Reference path creates a shape with smooth concave curves at diagonal corners
 */
function generateCornersRoundedPath(x: number, y: number, margin: number): string {
  const mx = x + margin;
  const my = y + margin;
  const size = 1;
  const r = size / 2; // Large radius (0.5) for pronounced rounding

  // Path: start at top-left, go down halfway, arc at bottom-left,
  // continue across bottom halfway, go up halfway, arc at top-right, close
  return `M${mx},${my} v${r} a${r},${r} 0 0 0 ${r},${r} h${r} v${-r} a${r},${r} 0 0 0 ${-r},${-r} z`;
}


export function generatePath(
  modules: Modules,
  margin = 0,
  dotType: DotType = DEFAULT_DOT_TYPE,
  eyes: ReturnType<typeof detectEyes> = []
): string {
  const ops: Array<string> = [];

  // For non-square patterns, we need to generate individual shapes for each module
  if (dotType !== "square") {
    modules.forEach(function (row, y) {
      row.forEach(function (cell, x) {
        if (!cell) return;

        // Skip eye regions - they will be rendered separately
        if (eyes.length > 0 && isInEye(x, y, eyes)) return;

        // Create neighbor checker for this module
        const getNeighbor = createGetNeighbor(modules, x, y);

        // Count neighbors - following qr-code-styling reference
        const left = getNeighbor(-1, 0);
        const right = getNeighbor(1, 0);
        const top = getNeighbor(0, -1);
        const bottom = getNeighbor(0, 1);

        const neighborCount = [left, right, top, bottom].filter(Boolean).length;

        // Check for opposite pairs (inline configuration)
        const hasOpposites = (left && right) || (top && bottom);

        // Determine if 2 neighbors form a corner (perpendicular, not opposite)
        const isCorner = neighborCount === 2 && !hasOpposites;

        // Following qr-code-styling reference implementation
        switch (dotType) {
          case "dots": {
            // Always use circles for dots pattern
            ops.push(generateDotsPath(x, y, margin));
            break;
          }
          case "rounded":
          case "extra-rounded": {
            const useExtraRounded = dotType === "extra-rounded";

            // Following qr-code-styling logic
            if (neighborCount > 2 || hasOpposites) {
              // Junction or inline: use square for full coverage
              ops.push(generateSquarePath(x, y, margin));
            } else if (neighborCount === 0) {
              // Isolated: use circle
              ops.push(useExtraRounded ? generateExtraRoundedPath(x, y, margin) : generateDotsPath(x, y, margin));
            } else if (neighborCount === 1) {
              // Single neighbor: use side-rounded (round the side WITHOUT neighbor)
              const neighborSide = left ? 'left' : right ? 'right' : top ? 'top' : 'bottom';
              ops.push(generateSideRoundedPath(x, y, margin, neighborSide));
            } else if (isCorner) {
              // Two perpendicular neighbors: use corner-rounded (round the corner WITHOUT neighbors)
              const corner = (left && top) ? 'bottom-right' :
                            (top && right) ? 'bottom-left' :
                            (right && bottom) ? 'top-left' : 'top-right';
              ops.push(generateCornerRoundedPath(x, y, margin, corner, useExtraRounded));
            } else {
              // Fallback to square
              ops.push(generateSquarePath(x, y, margin));
            }
            break;
          }
          case "classy": {
            // Reference: qr-code-styling _drawClassy method (lines 236-256)
            // Uses EXACTLY 2 conditional cases matching reference algorithm
            if (neighborCount === 0) {
              // 0 neighbors → corners-rounded (diagonal)
              ops.push(generateCornersRoundedPath(x, y, margin));
            } else if (!left && !top) {
              // Missing left+top neighbors → corner-rounded (rotation -π/2)
              ops.push(generateCornerRoundedPath(x, y, margin, 'top-left'));
            } else if (!right && !bottom) {
              // Missing right+bottom neighbors → corner-rounded (rotation π/2)
              ops.push(generateCornerRoundedPath(x, y, margin, 'bottom-right'));
            } else {
              // Otherwise → square
              ops.push(generateSquarePath(x, y, margin));
            }
            break;
          }
          default:
            ops.push(generateSquarePath(x, y, margin));
        }
      });
    });
    return ops.join("");
  }

  // Original optimized square path generation (single-path strategy for rectangles)
  modules.forEach(function (row, y) {
    let start: number | null = null;
    row.forEach(function (cell, x) {
      // Skip eye regions for square pattern too
      const isEyeModule = eyes.length > 0 && isInEye(x, y, eyes);

      if ((!cell || isEyeModule) && start !== null) {
        // M0 0h7v1H0z injects the space with the move and drops the comma,
        // saving a char per operation
        ops.push(
          `M${start + margin} ${y + margin}h${x - start}v1H${start + margin}z`,
        );
        start = null;
        return;
      }

      // end of row, clean up or skip
      if (x === row.length - 1) {
        if (!cell || isEyeModule) {
          // We would have closed the op above already so this can only mean
          // 2+ light modules in a row.
          return;
        }
        if (start === null) {
          // Just a single dark module.
          ops.push(`M${x + margin},${y + margin} h1v1H${x + margin}z`);
        } else {
          // Otherwise finish the current line.
          ops.push(
            `M${start + margin},${y + margin} h${x + 1 - start}v1H${
              start + margin
            }z`,
          );
        }
        return;
      }

      if (cell && !isEyeModule && start === null) {
        start = x;
      }
    });
  });
  return ops.join("");
}

export function getImageSettings(
  cells: Modules,
  size: number,
  margin: number,
  imageSettings?: ImageSettings,
): null | {
  x: number;
  y: number;
  h: number;
  w: number;
  excavation: Excavation | null;
} {
  if (imageSettings == null) {
    return null;
  }

  const qrCodeSize = cells.length;
  const defaultSize = Math.floor(size * DEFAULT_IMG_SCALE);
  const scale = qrCodeSize / size;
  const w = (imageSettings.width || defaultSize) * scale;
  const h = (imageSettings.height || defaultSize) * scale;

  // Center the image in the QR code area (without margins)
  const x =
    imageSettings.x == null ? qrCodeSize / 2 - w / 2 : imageSettings.x * scale;
  const y =
    imageSettings.y == null ? qrCodeSize / 2 - h / 2 : imageSettings.y * scale;

  let excavation: Excavation | null = null;
  if (imageSettings.excavate) {
    const floorX = Math.floor(x);
    const floorY = Math.floor(y);
    const ceilW = Math.ceil(w + x - floorX);
    const ceilH = Math.ceil(h + y - floorY);
    excavation = { x: floorX, y: floorY, w: ceilW, h: ceilH };
  }

  return { x, y, h, w, excavation };
}

export function convertImageSettingsToPixels(
  calculatedImageSettings: {
    x: number;
    y: number;
    w: number;
    h: number;
    excavation: Excavation | null;
  },
  size: number,
  numCells: number,
  margin: number,
) {
  const pixelRatio = size / numCells;
  const imgWidth = calculatedImageSettings.w * pixelRatio;
  const imgHeight = calculatedImageSettings.h * pixelRatio;
  const imgLeft = (calculatedImageSettings.x + margin) * pixelRatio;
  const imgTop = (calculatedImageSettings.y + margin) * pixelRatio;

  return { imgWidth, imgHeight, imgLeft, imgTop };
}

/**
 * Generate corner dots for circular QR codes
 * Fills the area outside the square QR but inside the circular boundary
 */
function generateCornerDots(numCells: number, margin: number, dotType: DotType): JSX.Element[] {
  const dots: JSX.Element[] = [];

  const params = getCircularBorderParams(numCells, margin);

  // Build occupancy grid for neighbor-aware shapes
  const borderCells: boolean[][] = Array.from({ length: params.gridSize }, () => Array(params.gridSize).fill(false));
  for (let y = 0; y < params.gridSize; y += 1) {
    for (let x = 0; x < params.gridSize; x += 1) {
      borderCells[y][x] = shouldPlaceCircularBorderDot(x, y, params);
    }
  }

  // Generate dots in a grid pattern, only rendering those in corner areas
  for (let y = 0; y < params.gridSize; y += 1) {
    for (let x = 0; x < params.gridSize; x += 1) {
      if (!borderCells[y][x]) continue;

      // Adjust coordinates to account for grid offset
      const cx = x + 0.5 - params.gridOffset;
      const cy = y + 0.5 - params.gridOffset;
      const dotX = x - params.gridOffset;
      const dotY = y - params.gridOffset;

      // Local size tweak to eliminate inner gap
      const localSize = getBorderDotSizeAt(x, y, params);

      // Neighbor lookup
      const getNeighbor = (dx: number, dy: number) => {
        const ny = y + dy;
        const nx = x + dx;
        if (ny < 0 || ny >= params.gridSize) return false;
        if (nx < 0 || nx >= params.gridSize) return false;
        return borderCells[ny][nx];
      };
      const left = getNeighbor(-1, 0);
      const right = getNeighbor(1, 0);
      const top = getNeighbor(0, -1);
      const bottom = getNeighbor(0, 1);
      const neighborCount = [left, right, top, bottom].filter(Boolean).length;
      const hasOpposites = (left && right) || (top && bottom);

      // Render dot based on dot type
      let dotPath = "";
      switch (dotType) {
        case "dots": {
          const r = localSize / 2;
          dotPath = `M${cx - r},${cy} a${r},${r} 0 1 0 ${localSize},0 a${r},${r} 0 1 0 ${-localSize},0z`;
          break;
        }
        case "rounded":
        case "extra-rounded": {
          if (neighborCount > 2 || hasOpposites) {
            dotPath = `M${dotX},${dotY} h${localSize}v${localSize}H${dotX}z`;
          } else if (neighborCount === 0) {
            const r = localSize / 2;
            dotPath = `M${cx - r},${cy} a${r},${r} 0 1 0 ${localSize},0 a${r},${r} 0 1 0 ${-localSize},0z`;
          } else if (neighborCount === 1) {
            const r = localSize / 2;
            if (left) {
              dotPath = `M${dotX},${dotY} v${localSize} h${localSize / 2} a${r},${r} 0 0 0 0,${-localSize} z`;
            } else if (right) {
              dotPath = `M${dotX + localSize},${dotY} v${localSize} h${-localSize / 2} a${r},${r} 0 0 1 0,${-localSize} z`;
            } else if (top) {
              dotPath = `M${dotX},${dotY} h${localSize} v${localSize / 2} a${r},${r} 0 0 1 ${-localSize},0 z`;
            } else {
              dotPath = `M${dotX},${dotY + localSize} h${localSize} v${-localSize / 2} a${r},${r} 0 0 0 ${-localSize},0 z`;
            }
          } else {
            dotPath = `M${dotX},${dotY} h${localSize}v${localSize}H${dotX}z`;
          }
          break;
        }
        case "classy": {
          const r = localSize / 2;
          if (neighborCount === 0) {
            dotPath = `M${dotX},${dotY} v${r} a${r},${r} 0 0 0 ${r},${r} h${r} v${-r} a${r},${r} 0 0 0 ${-r},${-r} z`;
          } else if (!left && !top) {
            dotPath = `M${dotX},${dotY + r} a${r},${r} 0 0 1 ${r},${-r} h${localSize - r} v${localSize} h${-localSize} z`;
          } else if (!right && !bottom) {
            dotPath = `M${dotX},${dotY} h${localSize} v${r} a${r},${r} 0 0 1 ${-r},${r} h${-localSize + r} z`;
          } else {
            dotPath = `M${dotX},${dotY} h${localSize}v${localSize}H${dotX}z`;
          }
          break;
        }
        default:
          // Square dots
          dotPath = `M${dotX},${dotY} h${localSize}v${localSize}H${dotX}z`;
      }

      dots.push(
        <path
          key={`corner-dot-${x}-${y}`}
          d={dotPath}
          fill="currentColor"
        />
      );
    }
  }

  return dots;
}

export function QRCodeSVG(props: QRPropsSVG) {
  const {
    value,
    size = DEFAULT_SIZE,
    level = DEFAULT_LEVEL,
    bgColor = DEFAULT_BGCOLOR,
    fgColor = DEFAULT_FGCOLOR,
    margin = DEFAULT_MARGIN,
    qrShape = "square",
    isOGContext = false,
    imageSettings,
    dotsOptions,
    eyeOptions,
    frameOptions,
    ...otherProps
  } = props;

  const shouldUseHigherErrorLevel =
    isOGContext && imageSettings?.excavate && (level === "L" || level === "M");

  // Use a higher error correction level 'Q' when excavation is enabled
  // to ensure the QR code remains scannable despite the removed modules.
  const effectiveLevel = shouldUseHigherErrorLevel ? "Q" : level;

  let cells = qrcodegen.QrCode.encodeText(
    value,
    ERROR_LEVEL_MAP[effectiveLevel],
  ).getModules();

  const numCells = cells.length + margin * 2;
  const calculatedImageSettings = getImageSettings(
    cells,
    size,
    margin,
    imageSettings,
  );

  let image: null | JSX.Element = null;
  if (imageSettings != null && calculatedImageSettings != null) {
    if (calculatedImageSettings.excavation != null) {
      cells = excavateModules(cells, calculatedImageSettings.excavation);
    }

    if (isOGContext) {
      const { imgWidth, imgHeight, imgLeft, imgTop } =
        convertImageSettingsToPixels(
          calculatedImageSettings,
          size,
          numCells,
          margin,
        );

      image = (
        <img
          src={imageSettings.src}
          alt="Logo"
          style={{
            position: "absolute",
            left: `${imgLeft}px`,
            top: `${imgTop}px`,
            width: `${imgWidth}px`,
            height: `${imgHeight}px`,
          }}
        />
      );
    } else {
      image = (
        <image
          href={imageSettings.src}
          height={calculatedImageSettings.h}
          width={calculatedImageSettings.w}
          x={calculatedImageSettings.x + margin}
          y={calculatedImageSettings.y + margin}
          preserveAspectRatio="none"
        />
      );
    }
  }

  // Detect eye positions for custom rendering
  const eyes = detectEyes(cells);

  // Drawing strategy: instead of a rect per module, we're going to create a
  // single path for the dark modules and layer that on top of a light rect,
  // for a total of 2 DOM nodes. We pay a bit more in string concat but that's
  // way faster than DOM ops.
  // For level 1, 441 nodes -> 2
  // For level 40, 31329 -> 2
  const dotType = dotsOptions?.type ?? DEFAULT_DOT_TYPE;
  const dotsColor = dotsOptions?.color ?? fgColor;
  const fgPath = generatePath(cells, margin, dotType, eyes);

  // Generate eye patterns
  const cornerSquareType = eyeOptions?.cornerSquare?.type ?? DEFAULT_CORNER_SQUARE_TYPE;
  const cornerDotType = eyeOptions?.cornerDot?.type ?? DEFAULT_CORNER_DOT_TYPE;
  const cornerSquareColor = eyeOptions?.cornerSquare?.color ?? fgColor;
  const cornerDotColor = eyeOptions?.cornerDot?.color ?? fgColor;

  const eyePaths = eyes.map((eye, index) => {
    const squarePath = generateCornerSquarePath(eye, cornerSquareType, margin);
    const dotPath = generateCornerDotPath(eye, cornerDotType, margin);
    return (
      <g key={`eye-${index}`}>
        <path
          fill={cornerSquareColor}
          d={squarePath}
          shapeRendering="crispEdges"
          fillRule="evenodd"
          clipRule="evenodd"
        />
        <path fill={cornerDotColor} d={dotPath} shapeRendering="crispEdges" />
      </g>
    );
  });

  // Calculate frame padding and total output size
  const frameType = frameOptions?.type ?? DEFAULT_FRAME_TYPE;

  // Corner dots (in QR cell units)
  const cornerDots = qrShape === "circle" ? generateCornerDots(numCells, margin, dotType) : null;

  // Compute shape padding so the QR core remains the same pixel size
  const params = getCircularBorderParams(numCells, margin);
  const scalePxPerCell = size / numCells;
  const shapePaddingPx = qrShape === "circle" ? params.gridOffset * scalePxPerCell : 0;

  // Frame padding computed on the full visual size (core + border)
  const framePaddingForFrame = getFramePadding(size + shapePaddingPx * 2, frameType);
  const outputSize = size + shapePaddingPx * 2 + framePaddingForFrame * 2;

  // Generate frame SVG if needed
  const frameSVG = frameOptions && frameOptions.type && frameOptions.type !== "none"
    ? renderSVGFrame({
        frameOptions,
        qrSize: size + shapePaddingPx * 2, // frame surrounds full visual content
        margin: 0,
      })
    : null;

  // Always render an outer SVG that can be larger than the core size when circular
  return (
    <svg
      height={outputSize}
      width={outputSize}
      viewBox={`0 0 ${outputSize} ${outputSize}`}
      {...otherProps}
    >
      {/* Background across entire output including any frame + shape padding */}
      <rect fill={bgColor} x={0} y={0} width={outputSize} height={outputSize} />

      {/* Corner dots for circular QR (drawn in outer space, scaled from cell units) */}
      {qrShape === "circle" && cornerDots && (
        <g
          fill={dotsColor}
          transform={`translate(${framePaddingForFrame + shapePaddingPx}, ${framePaddingForFrame + shapePaddingPx}) scale(${scalePxPerCell})`}
        >
          {cornerDots}
        </g>
      )}

      {/* Nested SVG for the QR core at exact size, preserving core dimensions */}
      <svg
        x={framePaddingForFrame + shapePaddingPx}
        y={framePaddingForFrame + shapePaddingPx}
        width={size}
        height={size}
        viewBox={`0 0 ${numCells} ${numCells}`}
      >
        {qrShape !== "circle" && (
          <path fill={bgColor} d={`M0,0 h${numCells}v${numCells}H0z`} shapeRendering="crispEdges" />
        )}
        <path fill={dotsColor} d={fgPath} shapeRendering="crispEdges" />
        {eyePaths}
        {image}
      </svg>

      {/* Frame elements rendered at the outer level */}
      {frameSVG && <g dangerouslySetInnerHTML={{ __html: frameSVG }} />}
    </svg>
  );
}

// For canvas we're going to switch our drawing mode based on whether or not
// the environment supports Path2D. We only need the constructor to be
// supported, but Edge doesn't actually support the path (string) type
// argument. Luckily it also doesn't support the addPath() method. We can
// treat that as the same thing.
export const SUPPORTS_PATH2D = (function () {
  try {
    new Path2D().addPath(new Path2D());
  } catch (e) {
    return false;
  }
  return true;
})();
