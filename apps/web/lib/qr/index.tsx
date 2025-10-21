/**
 * @license qrcode.react
 * Copyright (c) Paul O'Shannessy
 * SPDX-License-Identifier: ISC
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
} from "./constants";
import { DotType, DotsOptions, Modules, QRProps, QRPropsCanvas } from "./types";
import {
  SUPPORTS_PATH2D,
  excavateModules,
  generatePath,
  getImageSettings,
} from "./utils";
export * from "./types";
export * from "./utils";

// Helper function to render QR modules with different dot patterns on canvas
function renderCanvasModules(
  ctx: CanvasRenderingContext2D,
  cells: Modules,
  margin: number,
  dotType: DotType,
) {
  if (dotType === "square") {
    // For square patterns, use Path2D optimization if available
    if (SUPPORTS_PATH2D) {
      ctx.fill(new Path2D(generatePath(cells, margin)));
    } else {
      // Fallback: draw individual rectangles
      cells.forEach(function (row, rdx) {
        row.forEach(function (cell, cdx) {
          if (cell) {
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

      const cx = x + margin + 0.5;
      const cy = y + margin + 0.5;

      ctx.beginPath();

      switch (dotType) {
        case "rounded": {
          // Rounded rectangle
          const mx = x + margin;
          const my = y + margin;
          const r = 0.25;
          ctx.moveTo(mx + r, my);
          ctx.arcTo(mx + 1, my, mx + 1, my + 1, r);
          ctx.arcTo(mx + 1, my + 1, mx, my + 1, r);
          ctx.arcTo(mx, my + 1, mx, my, r);
          ctx.arcTo(mx, my, mx + 1, my, r);
          ctx.closePath();
          break;
        }
        case "dots": {
          // Circle
          const r = 0.45;
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          break;
        }
        case "classy": {
          // More rounded rectangle
          const mx = x + margin;
          const my = y + margin;
          const r = 0.4;
          ctx.moveTo(mx + r, my);
          ctx.arcTo(mx + 1, my, mx + 1, my + 1, r);
          ctx.arcTo(mx + 1, my + 1, mx, my + 1, r);
          ctx.arcTo(mx, my + 1, mx, my, r);
          ctx.arcTo(mx, my, mx + 1, my, r);
          ctx.closePath();
          break;
        }
        case "extra-rounded": {
          // Full circle
          const r = 0.5;
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          break;
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

      // We're going to scale this so that the number of drawable units
      // matches the number of cells. This avoids rounding issues, but does
      // result in some potentially unwanted single pixel issues between
      // blocks, only in environments that don't support Path2D.
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.height = canvas.width = size * pixelRatio;
      const scale = (size / numCells) * pixelRatio;
      ctx.scale(scale, scale);

      // Draw solid background, only paint dark modules.
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, numCells, numCells);

      ctx.fillStyle = fgColor;
      const dotType = dotsOptions?.type ?? DEFAULT_DOT_TYPE;
      renderCanvasModules(ctx, cells, margin, dotType);

      if (haveImageToRender) {
        ctx.drawImage(
          image,
          calculatedImageSettings.x + margin,
          calculatedImageSettings.y + margin,
          calculatedImageSettings.w,
          calculatedImageSettings.h,
        );
      }
    }
  });

  // Ensure we mark image loaded as false here so we trigger updating the
  // canvas in our other effect.
  useEffect(() => {
    setIsImageLoaded(false);
  }, [imgSrc]);

  const canvasStyle = { height: size, width: size, ...style };
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
        height={size}
        width={size}
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

  const dotType = dotsOptions?.type ?? DEFAULT_DOT_TYPE;
  const fgPath = generatePath(cells, margin, dotType);

  const svgData = [
    `<svg xmlns="http://www.w3.org/2000/svg" height="${size}" width="${size}" viewBox="0 0 ${numCells} ${numCells}">`,
    `<path fill="${bgColor}" d="M0,0 h${numCells}v${numCells}H0z" shapeRendering="crispEdges"></path>`,
    `<path fill="${fgColor}" d="${fgPath}" shapeRendering="crispEdges"></path>`,
    image,
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

  const pixelRatio = window.devicePixelRatio || 1;
  canvas.height = canvas.width = size * pixelRatio;
  const scale = (size / numCells) * pixelRatio;
  ctx.scale(scale, scale);

  // Draw solid background, only paint dark modules.
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, numCells, numCells);

  ctx.fillStyle = fgColor;
  const dotType = dotsOptions?.type ?? DEFAULT_DOT_TYPE;
  renderCanvasModules(ctx, cells, margin, dotType);

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
}: {
  url: string;
  fgColor?: string;
  hideLogo?: boolean;
  logo?: string;
  margin?: number;
  dotsOptions?: DotsOptions;
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
