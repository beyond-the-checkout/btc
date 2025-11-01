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
import { DotType } from "@/lib/qr/types";
import { DEFAULT_MARGIN } from "@/lib/qr/constants";
import { useDebounce } from "@/lib/hooks/use-debounce";

// QR Creator Constants
const QR_PREVIEW_SCALE = 1.3; // Optimal size for landing page preview
const COLOR_DEBOUNCE_MS = 300; // Balance between responsiveness and performance

export function QRCreator() {
  // URL state
  const [url, setUrl] = useState("");

  // QR shape state
  const [qrShape, setQrShape] = useState<"square" | "circle">("square");

  // Pattern state
  const [dotPattern, setDotPattern] = useState<DotType>("rounded");



  // Frame state
  const [frameStyle, setFrameStyle] = useState<"square" | "rounded" | "solid-circle" | "dotted-circle" | undefined>(
    undefined,
  );

  // Color state (non-debounced for immediate updates in color picker)
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

  const frameOptions = useMemo(
    () =>
      frameStyle
        ? {
            type: frameStyle,
            color: debouncedFgColor,
          }
        : undefined,
    [frameStyle, debouncedFgColor],
  );

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
