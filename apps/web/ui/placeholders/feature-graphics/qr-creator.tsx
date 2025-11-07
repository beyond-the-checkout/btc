"use client";

import { ClientOnly, Switch } from "@dub/ui";
import { DUB_QR_LOGO, CHECKOUT_BASE_URL, cn } from "@dub/utils";
import { useState, useCallback, useMemo } from "react";
import { QRCode } from "@/ui/shared/qr-code";
import {
  PatternSelector,
  QRShapeToggle,
  ColorPicker,
  FrameSelector,
} from "@/ui/shared/qr-customization";
import { DotType, frameStyleToFrameType } from "@/lib/qr/types";
import { DEFAULT_MARGIN } from "@/lib/qr/constants";
import { useDebounce } from "@/lib/hooks/use-debounce";

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

export function QRCreator() {
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
  const [frameStyle, setFrameStyle] = useState<"square" | "rounded" | "solid-circle" | "dotted-circle" | undefined>(
    undefined,
  );

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

  // Construct QR options
  const dotsOptions = useMemo(
    () => ({
      type: dotPattern,
      color: debouncedFgColor,
    }),
    [dotPattern, debouncedFgColor],
  );

  /**
   * Eye (corner) pattern options - uses 'square' type for both elements
   *
   * Rationale: Square eye patterns provide:
   * - Best scannability and error correction
   * - Clear visual distinction from the main dot pattern
   * - Professional, clean appearance
   * Both cornerSquare (outer frame) and cornerDot (inner dot) use the
   * same color as the main pattern for visual consistency.
   */
  const eyeOptions = useMemo(
    () => ({
      cornerSquare: {
        type: "square" as const,
        color: debouncedFgColor,
      },
      cornerDot: {
        type: "square" as const,
        color: debouncedFgColor,
      },
    }),
    [debouncedFgColor],
  );

  const frameOptions = useMemo(() => {
    const type = frameStyleToFrameType(frameStyle);
    return type
      ? {
          type,
          color: debouncedFgColor,
        }
      : undefined;
  }, [frameStyle, debouncedFgColor]);

  // Handler for URL change
  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  }, []);

  return (
    <div className="size-full [mask-image:linear-gradient(black_70%,transparent)]">
      <div
        className="mx-3.5 flex origin-top scale-95 cursor-default flex-col gap-6 rounded-xl border border-neutral-200 bg-white p-4 shadow-[0_20px_20px_0_#00000017]"
        aria-label="QR Code Creator"
      >

        {/* URL Input */}
        <div>
          <label htmlFor="qr-url-input" className="mb-2 block text-sm font-medium text-neutral-700">
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
          <span className="mb-2 block text-sm font-medium text-neutral-700">Preview</span>
          <div
            className="relative flex h-72 items-center justify-center overflow-hidden rounded-md border border-neutral-300 bg-white p-8"
          >
            <ClientOnly>
              <div className="relative flex size-full items-center justify-center">
                <QRCode
                  url={url || CHECKOUT_BASE_URL}
                  fgColor={debouncedFgColor}
                  hideLogo={hideLogo}
                  logo={DUB_QR_LOGO}
                  scale={QR_PREVIEW_SCALE}
                  margin={DEFAULT_MARGIN}
                  qrShape={qrShape}
                  dotsOptions={dotsOptions}
                  eyeOptions={eyeOptions}
                  frameOptions={frameOptions}
                />
              </div>
            </ClientOnly>
          </div>
        </div>

        {/* Logo Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-700">Show Logo</span>
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
        <PatternSelector value={dotPattern} onChange={setDotPattern} color={debouncedFgColor} />

        {/* Frame Selector */}
        <FrameSelector value={frameStyle} onChange={setFrameStyle} qrShape={qrShape} />

        {/* Color Picker */}
        <ColorPicker value={fgColor} onChange={setFgColor} label="Color" />
      </div>
    </div>
  );
}
