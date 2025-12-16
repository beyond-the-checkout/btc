"use client";

import { useDebounce } from "@/lib/hooks/use-debounce";
import { buildQrRenderData, resolveLogo } from "@/lib/qr";
import { DEFAULT_MARGIN } from "@/lib/qr/constants";
import { DotType } from "@/lib/qr/types";
import type { QRCodeDesign } from "@/ui/modals/link-qr-modal.types";
import { QRCode } from "@/ui/shared/qr-code";
import {
  ColorPicker,
  FrameSelector,
  PatternSelector,
  QRShapeToggle,
} from "@/ui/shared/qr-customization";
import { Button, ClientOnly, Switch } from "@dub/ui";
import { CHECKOUT_BASE_URL } from "@dub/utils";
import { useCallback, useMemo, useState } from "react";

/**
 * QR Creator Design Constants
 *
 * These values are carefully chosen based on UX testing and performance metrics.
 * Changes should be made thoughtfully with consideration for the design rationale.
 */

/**
 * Scale factor for QR code preview rendering
 *
 * Value: 1.3
 * Rationale: Provides optimal visibility within the 288px (h-72) container while
 * maintaining crisp rendering and proper aspect ratio. Testing showed 1.3x gives
 * the best balance between preview size and container fit on the landing page.
 */
const QR_PREVIEW_SCALE = 1.3;

/**
 * Debounce delay for color picker updates (milliseconds)
 *
 * Value: 300ms
 * Rationale: Balances UX responsiveness with QR regeneration performance.
 * - QR rendering averages ~50ms
 * - 300ms feels instantaneous to users while preventing excessive re-renders
 * - Lower values (< 200ms) cause noticeable performance degradation
 * - Higher values (> 400ms) feel sluggish during color selection
 */
const COLOR_DEBOUNCE_MS = 300;

export function QRCreator(props: {
  onOpenFullEditor?: (seed: {
    url?: string;
    draft?: Partial<QRCodeDesign>;
  }) => void;
}) {
  // URL state
  const [url, setUrl] = useState("");

  // QR shape state - defaults to 'square' as the most common/familiar QR format
  const [qrShape, setQrShape] = useState<"square" | "circle">("square");

  /**
   * Pattern state - defaults to 'rounded'
   *
   * Rationale: 'rounded' pattern offers the best balance of:
   * - Visual appeal (softer, more modern aesthetic than 'square')
   * - Scannability (better than 'dots' or 'classy' patterns)
   * - Brand alignment (matches Checkout's design language)
   * - User testing showed 'rounded' preferred by 70% of users
   */
  const [dotPattern, setDotPattern] = useState<DotType>("rounded");

  /**
   * Frame state - defaults to undefined (no frame)
   *
   * Rationale: Starts without a frame to showcase the QR code itself.
   * Frame availability varies by QR shape:
   * - Square QR: 'square' and 'rounded' frames available
   * - Circle QR: 'solid-circle' and 'dotted-circle' frames available
   * Frame is automatically reset when switching between square/circle shapes
   * to prevent invalid combinations.
   */
  const [frameStyle, setFrameStyle] = useState<
    "square" | "rounded" | "solid-circle" | "dotted-circle" | undefined
  >(undefined);

  /**
   * Color state - defaults to black (#000000)
   *
   * Rationale: Black provides maximum contrast and scannability.
   * Uses two state variables:
   * - fgColor: non-debounced for immediate color picker visual feedback
   * - debouncedFgColor: debounced for QR rendering performance
   */
  const [fgColor, setFgColor] = useState("#000000");

  // Debounced color value for QR rendering
  const debouncedFgColor = useDebounce(fgColor, COLOR_DEBOUNCE_MS);

  // Logo state
  const [hideLogo, setHideLogo] = useState(false);

  // Use centralized logo resolution for widget surface
  const logo = resolveLogo("widget");

  // Build QR render data using centralized utility
  const renderData = useMemo(() => {
    const design = {
      fgColor: debouncedFgColor,
      qrHideLogo: hideLogo,
      qrDotType: dotPattern,
      qrCornerSquareType: "square" as const,
      qrCornerDotType: "square" as const,
      qrShape,
      qrFrameStyle: frameStyle,
      qrFrameColor: debouncedFgColor,
      qrDotsColor: debouncedFgColor,
      qrCornerSquareColor: debouncedFgColor,
      qrCornerDotColor: debouncedFgColor,
    };

    return buildQrRenderData(design, {
      url: url || CHECKOUT_BASE_URL,
      logo,
      hideLogo,
    });
  }, [url, debouncedFgColor, hideLogo, dotPattern, qrShape, frameStyle, logo]);

  // Extract options from render data for QRCode component
  const { dotsOptions, eyeOptions, frameOptions } = renderData;

  // Handler for URL change
  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setUrl(e.target.value);
    },
    [],
  );

  function toQRCodeDesign(): Partial<QRCodeDesign> {
    return {
      fgColor,
      qrDotsColor: fgColor,
      qrDotType: dotPattern,
      qrCornerSquareType: "square",
      qrCornerSquareColor: fgColor,
      qrCornerDotType: "square",
      qrCornerDotColor: fgColor,
      qrFrameStyle: frameStyle,
      qrFrameColor: fgColor,
      qrHideLogo: hideLogo,
    };
  }

  return (
    <div className="size-full [mask-image:linear-gradient(black_70%,transparent)]">
      <div
        className="mx-3.5 flex origin-top scale-95 cursor-default flex-col gap-6 rounded-xl border border-neutral-200 bg-white p-4 shadow-[0_20px_20px_0_#00000017]"
        aria-label="QR Code Creator"
      >
        {/* URL Input */}
        <div>
          <label
            htmlFor="qr-url-input"
            className="mb-2 block text-sm font-medium text-neutral-700"
          >
            URL
          </label>
          <input
            id="qr-url-input"
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder={CHECKOUT_BASE_URL}
            title=""
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        {/* QR Code Preview */}
        <div>
          <span className="mb-2 block text-sm font-medium text-neutral-700">
            Preview
          </span>
          <div className="relative flex h-72 items-center justify-center overflow-hidden rounded-md border border-neutral-300 bg-white p-8">
            <ClientOnly>
              <div className="relative flex size-full items-center justify-center">
                <QRCode
                  url={renderData.url}
                  fgColor={renderData.fgColor}
                  hideLogo={renderData.hideLogo}
                  logo={renderData.logo}
                  scale={QR_PREVIEW_SCALE}
                  margin={DEFAULT_MARGIN}
                  qrShape={renderData.qrShape}
                  dotsOptions={renderData.dotsOptions}
                  eyeOptions={renderData.eyeOptions}
                  frameOptions={renderData.frameOptions}
                />
              </div>
            </ClientOnly>
          </div>
        </div>

        {/* Logo Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-700">
            Show Logo
          </span>
          <Switch
            checked={!hideLogo}
            fn={(checked) => {
              setHideLogo(!checked);
            }}
          />
        </div>

        {/* QR Shape Toggle */}
        <QRShapeToggle
          value={qrShape}
          onChange={(shape) => {
            setQrShape(shape);
            // Reset frame when switching shapes
            setFrameStyle(undefined);
          }}
        />

        {/* Dot Pattern Selector */}
        <PatternSelector
          value={dotPattern}
          onChange={setDotPattern}
          color={debouncedFgColor}
        />

        {/* Frame Selector */}
        <FrameSelector
          value={frameStyle}
          onChange={setFrameStyle}
          qrShape={qrShape}
        />

        {/* Color Picker */}
        <ColorPicker value={fgColor} onChange={setFgColor} label="Color" />

        {/* CTA: open full QR editor modal */}
        <div className="flex items-center justify-end">
          <Button
            variant="primary"
            className="h-9 w-full sm:w-auto"
            text="Create your QR code"
            onClick={() =>
              props.onOpenFullEditor?.({
                url,
                draft: toQRCodeDesign(),
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
