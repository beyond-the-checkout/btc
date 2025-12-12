"use client";

import { cn } from "@dub/utils";
import { useState } from "react";

// Color swatches from the actual QR editor
const MOCK_COLORS = ["#000000", "#0D6EFD", "#EB5C0C", "#059669", "#7C3AED"];

type DotPattern = "square" | "rounded" | "dots" | "classy" | "extra-rounded";
type EyeStyle = "square" | "rounded" | "dots" | "extra-rounded" | "leaf";
type Shape = "square" | "circle";
type FrameStyle = "none" | "square" | "rounded";

export function QRCustomization() {
  const [dotPattern, setDotPattern] = useState<DotPattern>("rounded");
  const [eyeStyle, setEyeStyle] = useState<EyeStyle>("dots");
  const [shape, setShape] = useState<Shape>("square");
  const [frameStyle, setFrameStyle] = useState<FrameStyle>("square");
  const [color, setColor] = useState(MOCK_COLORS[2]); // Orange default

  return (
    <div
      className="size-full pt-3 [mask-image:linear-gradient(black_60%,transparent)]"
      aria-hidden
    >
      <div className="mx-auto flex max-w-[340px] origin-top scale-[0.92] cursor-default flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-[0_20px_20px_0_#00000010]">
        {/* QR Preview */}
        <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
          <ShimmerBackground />
          <MockQRCode
            dotPattern={dotPattern}
            eyeStyle={eyeStyle}
            color={color}
          />
        </div>

        {/* Dot Pattern */}
        <div>
          <span className="mb-1.5 block text-xs font-medium text-neutral-600">
            Dot Pattern
          </span>
          <div className="flex items-center gap-1.5">
            {(
              [
                "square",
                "rounded",
                "dots",
                "classy",
                "extra-rounded",
              ] as DotPattern[]
            ).map((pattern) => (
              <button
                key={pattern}
                onClick={() => setDotPattern(pattern)}
                className={cn(
                  "flex size-7 items-center justify-center rounded-md border transition-all",
                  dotPattern === pattern
                    ? "border-black bg-neutral-50 ring-1 ring-black"
                    : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50",
                )}
              >
                <PatternIcon type={pattern} />
              </button>
            ))}
          </div>
        </div>

        {/* Corner Eyes */}
        <div>
          <span className="mb-1.5 block text-xs font-medium text-neutral-600">
            Corner Eyes
          </span>
          <div className="flex items-center gap-1.5">
            {(
              [
                "square",
                "rounded",
                "dots",
                "extra-rounded",
                "leaf",
              ] as EyeStyle[]
            ).map((style) => (
              <button
                key={style}
                onClick={() => setEyeStyle(style)}
                className={cn(
                  "flex size-7 items-center justify-center rounded-md border transition-all",
                  eyeStyle === style
                    ? "border-black bg-neutral-50 ring-1 ring-black"
                    : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50",
                )}
              >
                <EyeIcon type={style} />
              </button>
            ))}
          </div>
        </div>

        {/* Shape & Frame Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="mb-1.5 block text-xs font-medium text-neutral-600">
              Shape
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShape("square")}
                className={cn(
                  "flex size-7 items-center justify-center rounded-md border transition-all",
                  shape === "square"
                    ? "border-black bg-neutral-50 ring-1 ring-black"
                    : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50",
                )}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="6"
                    y="6"
                    width="12"
                    height="12"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </button>
              <button
                onClick={() => setShape("circle")}
                className={cn(
                  "flex size-7 items-center justify-center rounded-md border transition-all",
                  shape === "circle"
                    ? "border-black bg-neutral-50 ring-1 ring-black"
                    : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50",
                )}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="6"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div>
            <span className="mb-1.5 block text-xs font-medium text-neutral-600">
              Frame
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFrameStyle("none")}
                className={cn(
                  "flex size-7 items-center justify-center rounded-md border transition-all",
                  frameStyle === "none"
                    ? "border-black bg-neutral-50 ring-1 ring-black"
                    : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50",
                )}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <line
                    x1="4"
                    y1="20"
                    x2="20"
                    y2="4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <button
                onClick={() => setFrameStyle("square")}
                className={cn(
                  "flex size-7 items-center justify-center rounded-md border transition-all",
                  frameStyle === "square"
                    ? "border-black bg-neutral-50 ring-1 ring-black"
                    : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50",
                )}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="6"
                    y="6"
                    width="12"
                    height="12"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </button>
              <button
                onClick={() => setFrameStyle("rounded")}
                className={cn(
                  "flex size-7 items-center justify-center rounded-md border transition-all",
                  frameStyle === "rounded"
                    ? "border-black bg-neutral-50 ring-1 ring-black"
                    : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50",
                )}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="6"
                    y="6"
                    width="12"
                    height="12"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <span className="mb-1.5 block text-xs font-medium text-neutral-600">
            Color
          </span>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-20 shrink-0 overflow-hidden rounded-md border border-neutral-200">
              <div
                className="h-full w-8 border-r transition-colors"
                style={{ backgroundColor: color }}
              />
              <div className="flex flex-1 items-center px-1.5 text-[10px] font-medium text-neutral-600">
                {color.toUpperCase()}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {MOCK_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "size-5 rounded-full transition-all",
                    color === c
                      ? "ring-1 ring-black ring-offset-2"
                      : "hover:scale-110",
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShimmerBackground() {
  return (
    <div className="absolute inset-0 opacity-20">
      <div
        className="size-full"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 50%, transparent 30%, #f5f5f5 70%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent, transparent 4px, #e5e5e5 4px, #e5e5e5 5px)",
          opacity: 0.5,
        }}
      />
    </div>
  );
}

function MockQRCode({
  dotPattern,
  eyeStyle,
  color,
}: {
  dotPattern: DotPattern;
  eyeStyle: EyeStyle;
  color: string;
}) {
  // Generate dot elements based on pattern
  const getDotElement = (cx: number, cy: number, key: string) => {
    switch (dotPattern) {
      case "square":
        return (
          <rect key={key} x={cx - 0.5} y={cy - 0.5} width="1" height="1" />
        );
      case "rounded":
        return (
          <rect
            key={key}
            x={cx - 0.5}
            y={cy - 0.5}
            width="1"
            height="1"
            rx="0.25"
          />
        );
      case "dots":
        return <circle key={key} cx={cx} cy={cy} r="0.5" />;
      case "classy":
        return (
          <rect
            key={key}
            x={cx - 0.5}
            y={cy - 0.5}
            width="1"
            height="1"
            rx="0.15"
            ry="0.5"
          />
        );
      case "extra-rounded":
        return <circle key={key} cx={cx} cy={cy} r="0.5" />;
      default:
        return <circle key={key} cx={cx} cy={cy} r="0.5" />;
    }
  };

  // Eye outer frame based on style
  const getEyeOuter = (x: number, y: number) => {
    switch (eyeStyle) {
      case "square":
        return <rect x={x} y={y} width="7" height="7" rx="0" />;
      case "rounded":
        return <rect x={x} y={y} width="7" height="7" rx="1.5" />;
      case "dots":
        return <circle cx={x + 3.5} cy={y + 3.5} r="3.5" />;
      case "extra-rounded":
        return <rect x={x} y={y} width="7" height="7" rx="2.5" />;
      case "leaf":
        return (
          <path
            d={`M${x + 2} ${y}h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z`}
            transform={`translate(0, 0)`}
          />
        );
      default:
        return <rect x={x} y={y} width="7" height="7" rx="1.5" />;
    }
  };

  // Eye inner dot based on style
  const getEyeInner = (x: number, y: number) => {
    const cx = x + 3.5;
    const cy = y + 3.5;
    switch (eyeStyle) {
      case "square":
        return <rect x={x + 2} y={y + 2} width="3" height="3" />;
      case "rounded":
        return <rect x={x + 2} y={y + 2} width="3" height="3" rx="0.5" />;
      case "dots":
        return <circle cx={cx} cy={cy} r="1.5" />;
      case "extra-rounded":
        return <circle cx={cx} cy={cy} r="1.5" />;
      case "leaf":
        return <rect x={x + 2} y={y + 2} width="3" height="3" rx="0.5" />;
      default:
        return <circle cx={cx} cy={cy} r="1.5" />;
    }
  };

  // Data dot positions for a realistic QR pattern
  const dotPositions = [
    // Row near top
    [10.5, 2.5],
    [12.5, 2.5],
    [14.5, 2.5],
    [16.5, 2.5],
    [10.5, 4.5],
    [13.5, 4.5],
    [16.5, 4.5],
    [11.5, 6.5],
    [14.5, 6.5],
    [17.5, 6.5],
    // Middle area
    [10.5, 10.5],
    [12.5, 10.5],
    [14.5, 10.5],
    [18.5, 10.5],
    [22.5, 10.5],
    [24.5, 10.5],
    [2.5, 10.5],
    [4.5, 10.5],
    [6.5, 10.5],
    [2.5, 12.5],
    [6.5, 12.5],
    [10.5, 12.5],
    [18.5, 12.5],
    [22.5, 12.5],
    [26.5, 12.5],
    [4.5, 14.5],
    [8.5, 14.5],
    [10.5, 14.5],
    [18.5, 14.5],
    [20.5, 14.5],
    [24.5, 14.5],
    [2.5, 16.5],
    [6.5, 16.5],
    [10.5, 16.5],
    [18.5, 16.5],
    [22.5, 16.5],
    [26.5, 16.5],
    [4.5, 18.5],
    [8.5, 18.5],
    [10.5, 18.5],
    [12.5, 18.5],
    [14.5, 18.5],
    [16.5, 18.5],
    [20.5, 18.5],
    [24.5, 18.5],
    // Bottom area
    [10.5, 20.5],
    [12.5, 20.5],
    [16.5, 20.5],
    [20.5, 20.5],
    [24.5, 20.5],
    [10.5, 22.5],
    [14.5, 22.5],
    [18.5, 22.5],
    [20.5, 22.5],
    [22.5, 22.5],
    [26.5, 22.5],
    [10.5, 24.5],
    [12.5, 24.5],
    [16.5, 24.5],
    [20.5, 24.5],
    [24.5, 24.5],
    [10.5, 26.5],
    [14.5, 26.5],
    [18.5, 26.5],
    [22.5, 26.5],
    [26.5, 26.5],
  ];

  return (
    <svg
      width="96"
      height="96"
      viewBox="0 0 29 29"
      className="relative z-10 transition-all duration-200"
    >
      <path fill="#fff" d="M0 0h29v29H0z" />
      <g fill={color} className="transition-colors duration-200">
        {/* Top-left eye */}
        {getEyeOuter(2, 2)}
        <rect
          x="3"
          y="3"
          width="5"
          height="5"
          fill="white"
          rx={
            eyeStyle === "dots"
              ? "2.5"
              : eyeStyle === "extra-rounded"
                ? "1.5"
                : "0.5"
          }
        />
        {getEyeInner(2, 2)}

        {/* Top-right eye */}
        {getEyeOuter(20, 2)}
        <rect
          x="21"
          y="3"
          width="5"
          height="5"
          fill="white"
          rx={
            eyeStyle === "dots"
              ? "2.5"
              : eyeStyle === "extra-rounded"
                ? "1.5"
                : "0.5"
          }
        />
        {getEyeInner(20, 2)}

        {/* Bottom-left eye */}
        {getEyeOuter(2, 20)}
        <rect
          x="3"
          y="21"
          width="5"
          height="5"
          fill="white"
          rx={
            eyeStyle === "dots"
              ? "2.5"
              : eyeStyle === "extra-rounded"
                ? "1.5"
                : "0.5"
          }
        />
        {getEyeInner(2, 20)}

        {/* Data dots */}
        {dotPositions.map(([cx, cy], idx) =>
          getDotElement(cx, cy, `dot-${idx}`),
        )}
      </g>
    </svg>
  );
}

function PatternIcon({ type }: { type: DotPattern }) {
  const color = "#71717A";
  switch (type) {
    case "square":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill={color}>
          <rect x="1" y="1" width="4" height="4" />
          <rect x="6" y="1" width="4" height="4" />
          <rect x="11" y="1" width="4" height="4" />
          <rect x="1" y="6" width="4" height="4" />
          <rect x="11" y="11" width="4" height="4" />
        </svg>
      );
    case "rounded":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill={color}>
          <rect x="1" y="1" width="4" height="4" rx="1" />
          <rect x="6" y="1" width="4" height="4" rx="1" />
          <rect x="11" y="1" width="4" height="4" rx="1" />
          <rect x="1" y="6" width="4" height="4" rx="1" />
          <rect x="11" y="11" width="4" height="4" rx="1" />
        </svg>
      );
    case "dots":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill={color}>
          <circle cx="3" cy="3" r="2" />
          <circle cx="8" cy="3" r="2" />
          <circle cx="13" cy="3" r="2" />
          <circle cx="3" cy="8" r="2" />
          <circle cx="13" cy="13" r="2" />
        </svg>
      );
    case "classy":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill={color}>
          <rect x="1" y="1" width="4" height="4" rx="0" ry="2" />
          <rect x="6" y="1" width="4" height="4" rx="0" ry="2" />
          <rect x="11" y="1" width="4" height="4" rx="0" ry="2" />
          <rect x="1" y="6" width="4" height="4" rx="0" ry="2" />
          <rect x="11" y="11" width="4" height="4" rx="0" ry="2" />
        </svg>
      );
    case "extra-rounded":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill={color}>
          <rect x="1" y="1" width="4" height="4" rx="2" />
          <rect x="6" y="1" width="4" height="4" rx="2" />
          <rect x="11" y="1" width="4" height="4" rx="2" />
          <rect x="1" y="6" width="4" height="4" rx="2" />
          <rect x="11" y="11" width="4" height="4" rx="2" />
        </svg>
      );
    default:
      return null;
  }
}

function EyeIcon({ type }: { type: EyeStyle }) {
  const color = "#71717A";
  switch (type) {
    case "square":
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect
            x="1"
            y="1"
            width="12"
            height="12"
            stroke={color}
            strokeWidth="2"
          />
          <rect x="5" y="5" width="4" height="4" fill={color} />
        </svg>
      );
    case "rounded":
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect
            x="1"
            y="1"
            width="12"
            height="12"
            rx="2"
            stroke={color}
            strokeWidth="2"
          />
          <rect x="5" y="5" width="4" height="4" rx="1" fill={color} />
        </svg>
      );
    case "dots":
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="5.5" stroke={color} strokeWidth="2" />
          <circle cx="7" cy="7" r="2" fill={color} />
        </svg>
      );
    case "extra-rounded":
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect
            x="1"
            y="1"
            width="12"
            height="12"
            rx="4"
            stroke={color}
            strokeWidth="2"
          />
          <rect x="5" y="5" width="4" height="4" rx="2" fill={color} />
        </svg>
      );
    case "leaf":
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M3 1h8a4 4 0 0 1 4 4v8H5a4 4 0 0 1-4-4V1z"
            stroke={color}
            strokeWidth="2"
            fill="none"
          />
          <rect x="5" y="5" width="4" height="4" fill={color} />
        </svg>
      );
    default:
      return null;
  }
}
