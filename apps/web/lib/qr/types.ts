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

export type QRProps = {
  value: string;
  size?: number;
  level?: string;
  bgColor?: string;
  fgColor?: string;
  margin?: number;
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
