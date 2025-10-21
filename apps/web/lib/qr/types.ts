import type { CSSProperties } from "react";
import qrcodegen from "./codegen";
import { DOT_TYPES } from "./constants";

export type Modules = ReturnType<qrcodegen.QrCode["getModules"]>;
export type Excavation = { x: number; y: number; w: number; h: number };

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
  isOGContext?: boolean;
};
export type QRPropsCanvas = QRProps &
  React.CanvasHTMLAttributes<HTMLCanvasElement>;
export type QRPropsSVG = QRProps & React.SVGProps<SVGSVGElement>;
