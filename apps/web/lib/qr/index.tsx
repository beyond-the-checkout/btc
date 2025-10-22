/**
 * @license qrcode.react
 * Copyright (c) Paul O'Shannessy
 * SPDX-License-Identifier: ISC
 */

/**
 * Neighbor-aware QR dot rendering based on qr-code-styling by Denys Kozak
 * Repository: https://github.com/kozakdenys/qr-code-styling
 * License: MIT License
 *
 * Copyright (c) 2019 Denys Kozak
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { DUB_QR_LOGO } from "@dub/utils/src/constants";
import { useEffect, useRef, useState, type JSX } from "react";
import qrcodegen from "./codegen";
import {
  DEFAULT_BGCOLOR,
  DEFAULT_DOT_TYPE,
  DEFAULT_FGCOLOR,
  DEFAULT_LEVEL,
  DEFAULT_MARGIN,
  DEFAULT_SIZE,
  ERROR_LEVEL_MAP,
  DEFAULT_CORNER_SQUARE_TYPE,
  DEFAULT_CORNER_DOT_TYPE,
  DEFAULT_FRAME_TYPE,
} from "./constants";
import { DotType, DotsOptions, Modules, QRProps, QRPropsCanvas } from "./types";
import {
  SUPPORTS_PATH2D,
  createGetNeighbor,
  excavateModules,
  generatePath,
  getImageSettings,
} from "./utils";
import { detectEyes, isInEye } from "./eye-detector";
import {
  drawCornerSquareCanvas,
  drawCornerDotCanvas,
  generateCornerSquarePath,
  generateCornerDotPath,
} from "./eye-patterns";
import { renderCanvasFrame, getFramePadding, renderSVGFrame } from "./frames";
export * from "./types";
export * from "./utils";

/**
 * Helper: Draw base corner-rounded shape (regular, radius = 0.5)
 * Base shape has top-right corner rounded
 * Reference: _basicCornerRounded from qr-code-styling
 */
function drawBaseCornerRounded(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) {
  const r = size / 2;
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x + size, y + size);
  ctx.lineTo(x + size, y + r);
  ctx.arcTo(x + size, y, x + size - r, y, r);
  ctx.closePath();
}

/**
 * Helper: Draw base corner-extra-rounded shape (radius = 1.0)
 * Base shape has top-right corner rounded with large arc
 * Reference: _basicCornerExtraRounded from qr-code-styling
 */
function drawBaseCornerExtraRounded(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) {
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x + size, y + size);
  ctx.arcTo(x + size, y, x, y, size);
  ctx.closePath();
}

/**
 * Helper: Draw corner-rounded shape with rotation
 * Matches qr-code-styling approach: draw base shape, apply rotation transform
 */
function drawCornerRoundedWithRotation(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
  extraRounded: boolean,
) {
  const cx = x + size / 2;
  const cy = y + size / 2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.translate(-cx, -cy);

  ctx.beginPath();
  if (extraRounded) {
    drawBaseCornerExtraRounded(ctx, x, y, size);
  } else {
    drawBaseCornerRounded(ctx, x, y, size);
  }
  ctx.fill();

  ctx.restore();
}

// Helper function to render QR modules with different dot patterns on canvas
function renderCanvasModules(
  ctx: CanvasRenderingContext2D,
  cells: Modules,
  margin: number,
  dotType: DotType,
  eyes: ReturnType<typeof detectEyes> = []
) {
  if (dotType === "square") {
    // For square patterns, use Path2D optimization if available
    if (SUPPORTS_PATH2D) {
      ctx.fill(new Path2D(generatePath(cells, margin, dotType, eyes)));
    } else {
      // Fallback: draw individual rectangles
      cells.forEach(function (row, rdx) {
        row.forEach(function (cell, cdx) {
          if (cell && !(eyes.length > 0 && isInEye(cdx, rdx, eyes))) {
            ctx.fillRect(cdx + margin, rdx + margin, 1, 1);
          }
        });
      });
    }
    return;
  }

  // For non-square patterns, render individual shapes
  cells.forEach(function (row, y) {
    row.forEach(function (cell, x) {
      if (!cell) return;

      // Skip eye regions - they will be rendered separately
      if (eyes.length > 0 && isInEye(x, y, eyes)) return;

      const cx = x + margin + 0.5;
      const cy = y + margin + 0.5;
      const mx = x + margin;
      const my = y + margin;

      // Create neighbor checker for this module
      const getNeighbor = createGetNeighbor(cells, x, y);

      // Count neighbors - following qr-code-styling reference
      const left = getNeighbor(-1, 0);
      const right = getNeighbor(1, 0);
      const top = getNeighbor(0, -1);
      const bottom = getNeighbor(0, 1);
      const neighborCount = [left, right, top, bottom].filter(Boolean).length;

      // Check for opposite pairs (inline configuration)
      const hasOpposites = (left && right) || (top && bottom);

      ctx.beginPath();

      // Following qr-code-styling reference implementation
      switch (dotType) {
        case "dots": {
          // Always use circles for dots pattern
          const r = 0.45;
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          break;
        }
        case "rounded":
        case "extra-rounded": {
          const useExtraRounded = dotType === "extra-rounded";

          // Reference logic: neighborCount > 2 OR opposite pairs → square
          if (neighborCount > 2 || hasOpposites) {
            ctx.fillRect(mx, my, 1, 1);
            return;
          } else if (neighborCount === 0) {
            // Isolated dot → circle
            const r = useExtraRounded ? 0.5 : 0.45;
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
          } else if (neighborCount === 1) {
            // Single neighbor: use side-rounded (round the side WITHOUT neighbor)
            const size = 1;
            const r = size / 2; // Half the size for semicircle

            if (left) {
              // Neighbor on left, round the right side
              ctx.moveTo(mx, my);
              ctx.lineTo(mx, my + size);
              ctx.lineTo(mx + size / 2, my + size);
              ctx.arc(mx + size / 2, cy, r, Math.PI / 2, -Math.PI / 2, false);
              ctx.closePath();
            } else if (right) {
              // Neighbor on right, round the left side
              ctx.moveTo(mx + size, my);
              ctx.lineTo(mx + size, my + size);
              ctx.lineTo(mx + size / 2, my + size);
              ctx.arc(mx + size / 2, cy, r, Math.PI / 2, -Math.PI / 2, true);
              ctx.closePath();
            } else if (top) {
              // Neighbor on top, round the bottom side
              ctx.moveTo(mx, my);
              ctx.lineTo(mx + size, my);
              ctx.lineTo(mx + size, my + size / 2);
              ctx.arc(cx, my + size / 2, r, 0, Math.PI, false);
              ctx.closePath();
            } else if (bottom) {
              // Neighbor on bottom, round the top side
              ctx.moveTo(mx, my + size);
              ctx.lineTo(mx + size, my + size);
              ctx.lineTo(mx + size, my + size / 2);
              ctx.arc(cx, my + size / 2, r, 0, Math.PI, true);
              ctx.closePath();
            }
          } else {
            // 2 neighbors - check if it's a corner (perpendicular neighbors)
            const isCorner = neighborCount === 2 && !hasOpposites;

            if (isCorner) {
              // Two perpendicular neighbors: use corner-rounded with rotation
              // Matching qr-code-styling reference approach
              //
              // Rotation mapping from _drawRounded/_drawExtraRounded:
              // - bottom && left: rotation 0° → top-right corner rounded
              // - left && top: rotation π/2 (90°) → bottom-right corner rounded
              // - top && right: rotation π (180°) → bottom-left corner rounded
              // - right && bottom: rotation -π/2 (-90°) → top-left corner rounded

              let rotation = 0;
              if (left && top) {
                rotation = Math.PI / 2;
              } else if (top && right) {
                rotation = Math.PI;
              } else if (right && bottom) {
                rotation = -Math.PI / 2;
              }
              // bottom && left uses rotation = 0 (default)

              drawCornerRoundedWithRotation(ctx, mx, my, 1, rotation, useExtraRounded);
              return; // drawCornerRoundedWithRotation handles fill
            } else {
              // Inline neighbors (opposite) - use square
              ctx.fillRect(mx, my, 1, 1);
              return;
            }
          }
          break;
        }
        case "classy": {
          // Reference: qr-code-styling _drawClassy method (lines 236-256)
          // Uses EXACTLY 2 conditional cases matching reference algorithm
          const size = 1;
          const r = size / 2; // Radius (0.5) for corner rounding

          if (neighborCount === 0) {
            // 0 neighbors → corners-rounded (diagonal)
            ctx.moveTo(mx, my);
            ctx.lineTo(mx, my + r);
            ctx.arcTo(mx, my + size, mx + r, my + size, r); // Bottom-left arc
            ctx.lineTo(mx + size, my + size);
            ctx.lineTo(mx + size, my + r);
            ctx.arcTo(mx + size, my, mx + size - r, my, r); // Top-right arc
            ctx.closePath();
          } else if (!left && !top) {
            // Missing left+top neighbors → corner-rounded (rotation -π/2)
            ctx.moveTo(mx, my + r);
            ctx.arcTo(mx, my, mx + r, my, r); // Top-left arc
            ctx.lineTo(mx + size, my);
            ctx.lineTo(mx + size, my + size);
            ctx.lineTo(mx, my + size);
            ctx.closePath();
          } else if (!right && !bottom) {
            // Missing right+bottom neighbors → corner-rounded (rotation π/2)
            ctx.moveTo(mx, my);
            ctx.lineTo(mx + size, my);
            ctx.lineTo(mx + size, my + r);
            ctx.arcTo(mx + size, my + size, mx + size - r, my + size, r); // Bottom-right arc
            ctx.lineTo(mx, my + size);
            ctx.closePath();
          } else {
            // Otherwise → square
            ctx.fillRect(mx, my, 1, 1);
            return;
          }
          break;
        }
        default: {
          // Square fallback
          ctx.fillRect(mx, my, 1, 1);
          return; // Skip fill below since fillRect already filled
        }
      }

      ctx.fill();
    });
  });
}

export function QRCodeCanvas(props: QRPropsCanvas) {
  const {
    value,
    size = DEFAULT_SIZE,
    level = DEFAULT_LEVEL,
    bgColor = DEFAULT_BGCOLOR,
    fgColor = DEFAULT_FGCOLOR,
    margin = DEFAULT_MARGIN,
    style,
    imageSettings,
    dotsOptions,
    eyeOptions,
    frameOptions,
    ...otherProps
  } = props;
  const imgSrc = imageSettings?.src;
  const _canvas = useRef<HTMLCanvasElement>(null);
  const _image = useRef<HTMLImageElement>(null);

  // We're just using this state to trigger rerenders when images load. We
  // Don't actually read the value anywhere. A smarter use of useEffect would
  // depend on this value.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isImgLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    // Always update the canvas. It's cheap enough and we want to be correct
    // with the current state.
    if (_canvas.current != null) {
      const canvas = _canvas.current;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }

      let cells = qrcodegen.QrCode.encodeText(
        value,
        ERROR_LEVEL_MAP[level],
      ).getModules();

      const numCells = cells.length + margin * 2;
      const calculatedImageSettings = getImageSettings(
        cells,
        size,
        margin,
        imageSettings,
      );

      const image = _image.current;
      const haveImageToRender =
        calculatedImageSettings != null &&
        image !== null &&
        image.complete &&
        image.naturalHeight !== 0 &&
        image.naturalWidth !== 0;

      if (haveImageToRender) {
        if (calculatedImageSettings.excavation != null) {
          cells = excavateModules(cells, calculatedImageSettings.excavation);
        }
      }

      // Calculate frame size and padding
      const frameType = frameOptions?.type ?? DEFAULT_FRAME_TYPE;
      const framePadding = getFramePadding(size, frameType);
      const outputSize = framePadding > 0 ? size + framePadding * 2 : size;

      // We're going to scale this so that the number of drawable units
      // matches the number of cells. This avoids rounding issues, but does
      // result in some potentially unwanted single pixel issues between
      // blocks, only in environments that don't support Path2D.
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.height = canvas.width = outputSize * pixelRatio;
      const scale = (size / numCells) * pixelRatio;

      // Fill entire background (including frame area)
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Translate to account for frame padding
      ctx.save();
      ctx.translate(framePadding * pixelRatio, framePadding * pixelRatio);
      ctx.scale(scale, scale);

      // Detect eye positions for custom rendering
      const eyes = detectEyes(cells);

      // Draw solid background, only paint dark modules.
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, numCells, numCells);

      const dotType = dotsOptions?.type ?? DEFAULT_DOT_TYPE;
      const dotsColor = dotsOptions?.color ?? fgColor;
      ctx.fillStyle = dotsColor;
      renderCanvasModules(ctx, cells, margin, dotType, eyes);

      // Render eyes with custom patterns
      const cornerSquareType = eyeOptions?.cornerSquare?.type ?? DEFAULT_CORNER_SQUARE_TYPE;
      const cornerDotType = eyeOptions?.cornerDot?.type ?? DEFAULT_CORNER_DOT_TYPE;
      const cornerSquareColor = eyeOptions?.cornerSquare?.color ?? fgColor;
      const cornerDotColor = eyeOptions?.cornerDot?.color ?? fgColor;

      eyes.forEach((eye) => {
        ctx.fillStyle = cornerSquareColor;
        drawCornerSquareCanvas(ctx, eye, cornerSquareType, margin);

        ctx.fillStyle = cornerDotColor;
        drawCornerDotCanvas(ctx, eye, cornerDotType, margin);
      });

      if (haveImageToRender) {
        ctx.drawImage(
          image,
          calculatedImageSettings.x + margin,
          calculatedImageSettings.y + margin,
          calculatedImageSettings.w,
          calculatedImageSettings.h,
        );
      }

      // Restore context before rendering frame
      ctx.restore();

      // Render frame if specified
      if (frameOptions && frameOptions.type && frameOptions.type !== "none") {
        ctx.save();
        ctx.scale(pixelRatio, pixelRatio);
        renderCanvasFrame(ctx, {
          frameOptions,
          qrSize: size,
          margin: 0,
        });
        ctx.restore();
      }
    }
  });

  // Ensure we mark image loaded as false here so we trigger updating the
  // canvas in our other effect.
  useEffect(() => {
    setIsImageLoaded(false);
  }, [imgSrc]);

  // Calculate output size for canvas style (including frame if present)
  const frameType = frameOptions?.type ?? DEFAULT_FRAME_TYPE;
  const framePadding = getFramePadding(size, frameType);
  const outputSize = framePadding > 0 ? size + framePadding * 2 : size;
  const canvasStyle = { height: outputSize, width: outputSize, ...style };
  let img: JSX.Element | null = null;
  if (imgSrc != null) {
    img = (
      <img
        alt="QR code"
        src={imgSrc}
        key={imgSrc}
        style={{ display: "none" }}
        onLoad={() => {
          setIsImageLoaded(true);
        }}
        ref={_image}
      />
    );
  }
  return (
    <>
      <canvas
        style={canvasStyle}
        height={outputSize}
        width={outputSize}
        ref={_canvas}
        {...otherProps}
      />
      {img}
    </>
  );
}

export async function getQRAsSVGDataUri(props: QRProps) {
  const {
    value,
    size = DEFAULT_SIZE,
    level = DEFAULT_LEVEL,
    bgColor = DEFAULT_BGCOLOR,
    fgColor = DEFAULT_FGCOLOR,
    margin = DEFAULT_MARGIN,
    imageSettings,
    dotsOptions,
    eyeOptions,
    frameOptions,
  } = props;

  let cells = qrcodegen.QrCode.encodeText(
    value,
    ERROR_LEVEL_MAP[level],
  ).getModules();

  const numCells = cells.length + margin * 2;
  const calculatedImageSettings = getImageSettings(
    cells,
    size,
    margin,
    imageSettings,
  );

  let image = "";
  if (imageSettings != null && calculatedImageSettings != null) {
    if (calculatedImageSettings.excavation != null)
      cells = excavateModules(cells, calculatedImageSettings.excavation);

    const base64Image = await getBase64Image(imageSettings.src);

    image = [
      `<image href="${base64Image}"`,
      `height="${calculatedImageSettings.h}"`,
      `width="${calculatedImageSettings.w}"`,
      `x="${calculatedImageSettings.x + margin}"`,
      `y="${calculatedImageSettings.y + margin}"`,
      'preserveAspectRatio="none"></image>',
    ].join(" ");
  }

  const eyes = detectEyes(cells);
  const dotType = dotsOptions?.type ?? DEFAULT_DOT_TYPE;
  const dotsColor = dotsOptions?.color ?? fgColor;
  const fgPath = generatePath(cells, margin, dotType, eyes);

  // Generate eye patterns (inline to avoid JSX in this function)
  const cornerSquareType = eyeOptions?.cornerSquare?.type ?? DEFAULT_CORNER_SQUARE_TYPE;
  const cornerDotType = eyeOptions?.cornerDot?.type ?? DEFAULT_CORNER_DOT_TYPE;
  const cornerSquareColor = eyeOptions?.cornerSquare?.color ?? fgColor;
  const cornerDotColor = eyeOptions?.cornerDot?.color ?? fgColor;

  const eyePaths = eyes.map((eye) => {
    const squarePath = generateCornerSquarePath(eye, cornerSquareType, margin);
    const dotPath = generateCornerDotPath(eye, cornerDotType, margin);
    return [
      `<path fill="${cornerSquareColor}" d="${squarePath}" shapeRendering="crispEdges" fill-rule="evenodd" clip-rule="evenodd"></path>`,
      `<path fill="${cornerDotColor}" d="${dotPath}" shapeRendering="crispEdges"></path>`,
    ].join("");
  }).join("");

  // Calculate frame parameters
  const frameType = frameOptions?.type ?? DEFAULT_FRAME_TYPE;
  const framePadding = getFramePadding(size, frameType);
  const outputSize = framePadding > 0 ? size + framePadding * 2 : size;

  // Generate frame SVG if needed
  const frameSVG = frameOptions && frameOptions.type && frameOptions.type !== "none"
    ? renderSVGFrame({
        frameOptions,
        qrSize: size,
        margin: 0,
      })
    : "";

  // If we have a frame, wrap QR code in a nested SVG at the correct position
  const qrContent = framePadding > 0
    ? [
        `<svg x="${framePadding}" y="${framePadding}" width="${size}" height="${size}" viewBox="0 0 ${numCells} ${numCells}">`,
        `<path fill="${bgColor}" d="M0,0 h${numCells}v${numCells}H0z" shapeRendering="crispEdges"></path>`,
        `<path fill="${dotsColor}" d="${fgPath}" shapeRendering="crispEdges"></path>`,
        eyePaths,
        image,
        `</svg>`,
      ].join("")
    : [
        `<svg viewBox="0 0 ${numCells} ${numCells}" width="${size}" height="${size}">`,
        `<path fill="${bgColor}" d="M0,0 h${numCells}v${numCells}H0z" shapeRendering="crispEdges"></path>`,
        `<path fill="${dotsColor}" d="${fgPath}" shapeRendering="crispEdges"></path>`,
        eyePaths,
        image,
        `</svg>`,
      ].join("");

  const svgData = [
    `<svg xmlns="http://www.w3.org/2000/svg" height="${outputSize}" width="${outputSize}" viewBox="0 0 ${outputSize} ${outputSize}">`,
    `<rect fill="${bgColor}" x="0" y="0" width="${outputSize}" height="${outputSize}" />`,
    qrContent,
    frameSVG,
    "</svg>",
  ].join("");

  return `data:image/svg+xml,${encodeURIComponent(svgData)}`;
}

const getBase64Image = (imgUrl: string) => {
  return new Promise(function (resolve, reject) {
    const img = new Image();
    img.src = imgUrl;
    img.setAttribute("crossOrigin", "anonymous");

    img.onload = function () {
      const canvas = document.createElement("canvas");

      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);

      const dataURL = canvas.toDataURL("image/png");
      resolve(dataURL);
    };

    img.onerror = function () {
      reject("The image could not be loaded.");
    };
  });
};

function waitUntilImageLoaded(img: HTMLImageElement, src: string) {
  return new Promise((resolve) => {
    function onFinish() {
      img.onload = null;
      img.onerror = null;
      resolve(true);
    }
    img.onload = onFinish;
    img.onerror = onFinish;
    img.src = src;
    img.loading = "eager";
  });
}

export async function getQRAsCanvas(
  props: QRProps,
  type: string,
  getCanvas?: boolean,
): Promise<HTMLCanvasElement | string> {
  const {
    value,
    size = DEFAULT_SIZE,
    level = DEFAULT_LEVEL,
    bgColor = DEFAULT_BGCOLOR,
    fgColor = DEFAULT_FGCOLOR,
    margin = DEFAULT_MARGIN,
    imageSettings,
    dotsOptions,
    eyeOptions,
    frameOptions,
  } = props;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  let cells = qrcodegen.QrCode.encodeText(
    value,
    ERROR_LEVEL_MAP[level],
  ).getModules();
  const numCells = cells.length + margin * 2;
  const calculatedImageSettings = getImageSettings(
    cells,
    size,
    margin,
    imageSettings,
  );

  const image = new Image();
  image.crossOrigin = "anonymous";
  if (calculatedImageSettings) {
    // @ts-expect-error: imageSettings is not null
    await waitUntilImageLoaded(image, imageSettings.src);
    if (calculatedImageSettings.excavation != null) {
      cells = excavateModules(cells, calculatedImageSettings.excavation);
    }
  }

  // Calculate frame size and padding
  const frameType = frameOptions?.type ?? DEFAULT_FRAME_TYPE;
  const framePadding = getFramePadding(size, frameType);
  const outputSize = framePadding > 0 ? size + framePadding * 2 : size;

  const pixelRatio = window.devicePixelRatio || 1;
  canvas.height = canvas.width = outputSize * pixelRatio;
  const scale = (size / numCells) * pixelRatio;

  // Fill entire background (including frame area)
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Translate to account for frame padding
  ctx.save();
  ctx.translate(framePadding * pixelRatio, framePadding * pixelRatio);
  ctx.scale(scale, scale);

  const eyes = detectEyes(cells);

  // Draw solid background, only paint dark modules.
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, numCells, numCells);

  const dotType = dotsOptions?.type ?? DEFAULT_DOT_TYPE;
  const dotsColor = dotsOptions?.color ?? fgColor;
  ctx.fillStyle = dotsColor;
  renderCanvasModules(ctx, cells, margin, dotType, eyes);

  // Render eyes with custom patterns
  const cornerSquareType = eyeOptions?.cornerSquare?.type ?? DEFAULT_CORNER_SQUARE_TYPE;
  const cornerDotType = eyeOptions?.cornerDot?.type ?? DEFAULT_CORNER_DOT_TYPE;
  const cornerSquareColor = eyeOptions?.cornerSquare?.color ?? fgColor;
  const cornerDotColor = eyeOptions?.cornerDot?.color ?? fgColor;

  eyes.forEach((eye) => {
    ctx.fillStyle = cornerSquareColor;
    drawCornerSquareCanvas(ctx, eye, cornerSquareType, margin);

    ctx.fillStyle = cornerDotColor;
    drawCornerDotCanvas(ctx, eye, cornerDotType, margin);
  });

  const haveImageToRender =
    calculatedImageSettings != null &&
    image !== null &&
    image.complete &&
    image.naturalHeight !== 0 &&
    image.naturalWidth !== 0;
  if (haveImageToRender) {
    ctx.drawImage(
      image,
      calculatedImageSettings.x + margin,
      calculatedImageSettings.y + margin,
      calculatedImageSettings.w,
      calculatedImageSettings.h,
    );
  }

  // Restore context before rendering frame
  ctx.restore();

  // Render frame if specified
  if (frameOptions && frameOptions.type && frameOptions.type !== "none") {
    ctx.save();
    ctx.scale(pixelRatio, pixelRatio);
    renderCanvasFrame(ctx, {
      frameOptions,
      qrSize: size,
      margin: 0,
    });
    ctx.restore();
  }

  if (getCanvas) return canvas;

  const url = canvas.toDataURL(type, 1.0);
  canvas.remove();
  image.remove();
  return url;
}

export function getQRData({
  url,
  fgColor,
  hideLogo,
  logo,
  margin,
  dotsOptions,
  eyeOptions,
  frameOptions,
}: {
  url: string;
  fgColor?: string;
  hideLogo?: boolean;
  logo?: string;
  margin?: number;
  dotsOptions?: DotsOptions;
  eyeOptions?: import("./types").EyeOptions;
  frameOptions?: import("./types").FrameOptions;
}) {
  return {
    value: `${url}?qr=1`,
    bgColor: "#ffffff",
    fgColor,
    size: 1024,
    level: "Q", // QR Code error correction level: https://blog.qrstuff.com/general/qr-code-error-correction
    hideLogo,
    margin,
    dotsOptions,
    eyeOptions,
    frameOptions,
    ...(!hideLogo && {
      imageSettings: {
        src: logo || DUB_QR_LOGO,
        height: 256,
        width: 256,
        excavate: true,
      },
    }),
  };
}
