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
} from "./constants";
import { DotType, Excavation, GetNeighbor, ImageSettings, Modules, QRPropsSVG } from "./types";

import type { JSX } from "react";

// Helper function to create a neighbor checker for a specific module position
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


export function generatePath(modules: Modules, margin = 0, dotType: DotType = DEFAULT_DOT_TYPE): string {
  const ops: Array<string> = [];

  // For non-square patterns, we need to generate individual shapes for each module
  if (dotType !== "square") {
    modules.forEach(function (row, y) {
      row.forEach(function (cell, x) {
        if (!cell) return;

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
      if (!cell && start !== null) {
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
        if (!cell) {
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

      if (cell && start === null) {
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

export function QRCodeSVG(props: QRPropsSVG) {
  const {
    value,
    size = DEFAULT_SIZE,
    level = DEFAULT_LEVEL,
    bgColor = DEFAULT_BGCOLOR,
    fgColor = DEFAULT_FGCOLOR,
    margin = DEFAULT_MARGIN,
    isOGContext = false,
    imageSettings,
    dotsOptions,
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

  // Drawing strategy: instead of a rect per module, we're going to create a
  // single path for the dark modules and layer that on top of a light rect,
  // for a total of 2 DOM nodes. We pay a bit more in string concat but that's
  // way faster than DOM ops.
  // For level 1, 441 nodes -> 2
  // For level 40, 31329 -> 2
  const dotType = dotsOptions?.type ?? DEFAULT_DOT_TYPE;
  const fgPath = generatePath(cells, margin, dotType);

  return (
    <svg
      height={size}
      width={size}
      viewBox={`0 0 ${numCells} ${numCells}`}
      {...otherProps}
    >
      <path
        fill={bgColor}
        d={`M0,0 h${numCells}v${numCells}H0z`}
        shapeRendering="crispEdges"
      />
      <path fill={fgColor} d={fgPath} shapeRendering="crispEdges" />
      {image}
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
