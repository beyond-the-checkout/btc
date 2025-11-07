import type { CSSProperties } from "react";
import qrcodegen from "./codegen";
import {
  DOT_TYPES,
  CornerSquareType,
  CornerDotType,
  FrameType,
} from "./constants";

export type Modules = ReturnType<qrcodegen.QrCode["getModules"]>;
export type Excavation = { x: number; y: number; w: number; h: number };

// Helper type for checking neighboring QR code modules
export type GetNeighbor = (dx: number, dy: number) => boolean;

// Dot pattern type for QR code customization
export type DotType = (typeof DOT_TYPES)[number];

export type ImageSettings = {
  src: string;
  height: number;
  width: number;
  excavate: boolean;
  x?: number;
  y?: number;
};

export type DotsOptions = {
  type?: DotType;
  color?: string;
};

export type CornerSquareOptions = {
  type?: CornerSquareType;
  color?: string;
};

export type CornerDotOptions = {
  type?: CornerDotType;
  color?: string;
};

export type EyeOptions = {
  cornerSquare?: CornerSquareOptions;
  cornerDot?: CornerDotOptions;
};

export type FrameOptions = {
  type?: FrameType;
  color?: string;
  text?: string;
  textColor?: string;
  textSize?: number;
};

// UI-facing frame styles (what components/editors use)
export type QRFrameStyle =
  | "square"
  | "rounded"
  | "solid-circle"
  | "dotted-circle"
  | "dots-circle";

// Normalize UI frame styles to a canonical value
export const normalizeQRFrameStyle = (
  style: string | undefined,
): QRFrameStyle | undefined => {
  if (!style) return undefined;
  return style === "dotted-circle" ? "dots-circle" : (style as QRFrameStyle);
};

// Map normalized UI frame style to the renderer FrameType
export const frameStyleToFrameType = (
  style: string | undefined,
): FrameType | undefined => {
  if (!style) return undefined;
  const s = normalizeQRFrameStyle(style);
  switch (s) {
    case "rounded":
      return "rounded-square";
    case "solid-circle":
      return "circle";
    case "dots-circle":
      return "dots-circle";
    case "square":
      return "square";
    default:
      return undefined;
  }
};

export type QRProps = {
  value: string;
  size?: number;
  level?: string;
  bgColor?: string;
  fgColor?: string;
  margin?: number;
  qrShape?: "square" | "circle";
  style?: CSSProperties;
  imageSettings?: ImageSettings;
  dotsOptions?: DotsOptions;
  eyeOptions?: EyeOptions;
  frameOptions?: FrameOptions;
  isOGContext?: boolean;
};
export type QRPropsCanvas = QRProps &
  React.CanvasHTMLAttributes<HTMLCanvasElement>;
export type QRPropsSVG = QRProps & React.SVGProps<SVGSVGElement>;
