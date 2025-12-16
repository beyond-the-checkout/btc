/**
 * QR Render Utilities
 *
 * Centralized utilities for building QR render data across all surfaces.
 * This module provides a single source of truth for:
 * - QR render input/output types
 * - Default design values per surface
 * - Color fallback resolution
 * - Frame style normalization
 * - Logo resolution logic
 * - Filename generation
 */

import {
  DEFAULT_CORNER_DOT_TYPE,
  DEFAULT_CORNER_SQUARE_TYPE,
  DEFAULT_DOT_TYPE,
  DEFAULT_FGCOLOR,
  type CornerDotType,
  type CornerSquareType,
} from "./constants";
import { getQRData } from "./index";
import {
  frameStyleToFrameType,
  type DotType,
  type FrameOptions,
} from "./types";

/**
 * Local QR logo path for client-side canvas rendering.
 * Uses same-origin path to avoid CORS issues during canvas export.
 * The external DUB_QR_LOGO (assets.chko.sh) lacks CORS headers,
 * causing logo to be skipped in downloaded QR codes.
 */
const LOCAL_QR_LOGO = "/logos/checkmark_black.png";

/**
 * Surface types where QR codes are rendered.
 * Each surface may have different default behaviors.
 */
export type QRSurface =
  | "link-modal" // Full-featured editor in link builder
  | "landing" // Public landing page creator
  | "welcome" // Post-signup welcome modal
  | "widget"; // Embedded widget on placeholder pages

/**
 * Canonical QR design input - the UI-facing shape stored in drafts/cookies.
 * This matches QRCodeDesign from link-qr-modal.types.ts
 */
export type QRDesignInput = {
  fgColor: string;
  qrHideLogo: boolean;
  qrDotType: DotType;
  qrCornerSquareType: CornerSquareType;
  qrCornerDotType: CornerDotType;
  qrShape: "square" | "circle";
  qrFrameStyle?: "square" | "rounded" | "solid-circle" | "dotted-circle";
  qrFrameColor?: string;
  qrDotsColor?: string;
  qrCornerSquareColor?: string;
  qrCornerDotColor?: string;
};

/**
 * Options for building QR render data
 */
export type BuildQrRenderOptions = {
  url: string;
  logo?: string;
  hideLogo?: boolean;
  /** Override default color (used when design.fgColor should be ignored) */
  defaultColor?: string;
};

/**
 * Output from buildQrRenderData - ready to pass to getQRData or QRCode component
 */
export type QrRenderData = {
  url: string;
  /**
   * The resolved primary foreground color for the QR code.
   *
   * Note: This is set to the resolved dots color (qrDotsColor → fgColor → defaultColor),
   * NOT the raw fgColor input from the design. This intentional behavior ensures
   * consistency when the QR is passed to downstream components, as the top-level
   * fgColor is used as a fallback by many rendering functions.
   */
  fgColor: string;
  hideLogo: boolean;
  logo: string | undefined;
  qrShape: "square" | "circle";
  dotsOptions: {
    type: DotType;
    color: string;
  };
  eyeOptions: {
    cornerSquare: {
      type: CornerSquareType;
      color: string;
    };
    cornerDot: {
      type: CornerDotType;
      color: string;
    };
  };
  frameOptions: FrameOptions | undefined;
};

/**
 * Color fallback resolution order:
 * 1. Specific color field (e.g., qrDotsColor)
 * 2. fgColor from design
 * 3. Default black
 *
 * This ensures consistent color inheritance across all QR elements.
 */
function resolveColor(
  specificColor: string | undefined,
  fgColor: string | undefined,
  defaultColor: string = DEFAULT_FGCOLOR,
): string {
  return specificColor || fgColor || defaultColor;
}

/**
 * Build frame options from design, applying normalization.
 * Returns undefined if no frame is specified.
 *
 * Note: This function does not validate frame/shape compatibility (e.g., circle frames
 * on square QR codes). The UI layer is responsible for ensuring that only compatible
 * frame styles are presented to the user based on the selected QR shape. The frame
 * rendering functions will render whatever combination is provided, which may result
 * in visual inconsistencies if incompatible options are combined.
 */
function buildFrameOptions(
  design: Partial<QRDesignInput>,
  resolvedDotsColor: string,
): FrameOptions | undefined {
  const style = design.qrFrameStyle;
  if (!style) return undefined;

  const type = frameStyleToFrameType(style);
  if (!type || type === "none") return undefined;

  // Frame color fallback: qrFrameColor → qrDotsColor → fgColor
  const color = design.qrFrameColor || resolvedDotsColor;

  return { type, color };
}

/**
 * Build complete QR render data from a design and options.
 *
 * This is the primary utility for converting a QRCodeDesign (UI state)
 * into render-ready data for getQRData, QRCode component, or canvas export.
 *
 * Color Resolution Order:
 * - Dots: qrDotsColor → fgColor → defaultColor
 * - Corner Square: qrCornerSquareColor → fgColor → defaultColor
 * - Corner Dot: qrCornerDotColor → fgColor → defaultColor
 * - Frame: qrFrameColor → dotsColor (already resolved)
 *
 * @example
 * ```ts
 * const renderData = buildQrRenderData(draft, { url, logo });
 * const qrData = getQRData(renderData);
 * ```
 */
export function buildQrRenderData(
  design: Partial<QRDesignInput>,
  options: BuildQrRenderOptions,
): QrRenderData {
  const { url, logo, hideLogo, defaultColor = DEFAULT_FGCOLOR } = options;

  // Resolve base color
  const fgColor = design.fgColor || defaultColor;

  // Resolve element-specific colors with fallback chain
  const dotsColor = resolveColor(design.qrDotsColor, fgColor, defaultColor);
  const cornerSquareColor = resolveColor(
    design.qrCornerSquareColor,
    fgColor,
    defaultColor,
  );
  const cornerDotColor = resolveColor(
    design.qrCornerDotColor,
    fgColor,
    defaultColor,
  );

  // Resolve hideLogo: explicit option overrides design
  const resolvedHideLogo = hideLogo ?? design.qrHideLogo ?? false;

  // Build frame options
  const frameOptions = buildFrameOptions(design, dotsColor);

  return {
    url,
    fgColor: dotsColor, // Top-level fgColor uses dots color for consistency
    hideLogo: resolvedHideLogo,
    logo: resolvedHideLogo ? undefined : logo,
    qrShape: design.qrShape || "square",
    dotsOptions: {
      type: design.qrDotType || DEFAULT_DOT_TYPE,
      color: dotsColor,
    },
    eyeOptions: {
      cornerSquare: {
        type: design.qrCornerSquareType || DEFAULT_CORNER_SQUARE_TYPE,
        color: cornerSquareColor,
      },
      cornerDot: {
        type: design.qrCornerDotType || DEFAULT_CORNER_DOT_TYPE,
        color: cornerDotColor,
      },
    },
    frameOptions,
  };
}

/**
 * Convert QrRenderData to the format expected by getQRData.
 * This adds the ?qr=1 suffix and configures image settings.
 */
export function toQRDataInput(renderData: QrRenderData) {
  return getQRData({
    url: renderData.url,
    fgColor: renderData.fgColor,
    hideLogo: renderData.hideLogo,
    logo: renderData.logo,
    qrShape: renderData.qrShape,
    dotsOptions: renderData.dotsOptions,
    eyeOptions: renderData.eyeOptions,
    frameOptions: renderData.frameOptions,
  });
}

/**
 * Surface-specific default designs.
 *
 * Key differences:
 * - link-modal: Full customization, plan-gated logo toggle
 * - landing/welcome/widget: Fixed DUB_QR_LOGO, no logo upload, simpler defaults
 */
export function getDefaultQRDesign(surface: QRSurface): QRDesignInput {
  const baseDefaults: QRDesignInput = {
    fgColor: DEFAULT_FGCOLOR,
    qrHideLogo: false,
    qrDotType: DEFAULT_DOT_TYPE,
    qrCornerSquareType: DEFAULT_CORNER_SQUARE_TYPE,
    qrCornerDotType: DEFAULT_CORNER_DOT_TYPE,
    qrShape: "square",
    qrFrameStyle: undefined,
    qrFrameColor: undefined,
    qrDotsColor: undefined,
    qrCornerSquareColor: undefined,
    qrCornerDotColor: undefined,
  };

  switch (surface) {
    case "link-modal":
      // Full-featured editor uses base defaults
      return baseDefaults;

    case "landing":
    case "widget":
      // Landing page and widget use 'rounded' pattern for modern look
      return {
        ...baseDefaults,
        qrDotType: "rounded",
      };

    case "welcome":
      // Welcome modal inherits from seed or uses base defaults
      return baseDefaults;

    default:
      return baseDefaults;
  }
}

/**
 * Logo resolution based on surface and plan.
 *
 * Surface-specific behavior:
 * - link-modal: Plan-aware, can use workspace/domain logo, toggle available for paid
 * - landing/welcome/widget: Always LOCAL_QR_LOGO (same-origin for CORS), no toggle
 *
 * @param surface - Where the QR is being rendered
 * @param plan - Workspace plan (only relevant for link-modal)
 * @param workspaceLogo - Custom workspace logo URL
 * @param domainLogo - Custom domain logo URL
 * @returns The logo URL to use, or undefined if logo should be hidden
 */
export function resolveLogo(
  surface: QRSurface,
  plan?: string,
  workspaceLogo?: string | null,
  domainLogo?: string | null,
): string {
  switch (surface) {
    case "link-modal":
      // Plan-aware logo selection
      if (plan === "free") {
        return LOCAL_QR_LOGO;
      }
      // Paid plans: prefer domain logo, then workspace, then default
      return domainLogo || workspaceLogo || LOCAL_QR_LOGO;

    case "landing":
    case "welcome":
    case "widget":
      // Public surfaces always use branded logo (same-origin for CORS)
      return LOCAL_QR_LOGO;

    default:
      return LOCAL_QR_LOGO;
  }
}

/**
 * Whether logo toggle (hide/show) is available for a surface.
 * Only paid plans in link-modal can toggle logo visibility.
 */
export function canToggleLogo(surface: QRSurface, plan?: string): boolean {
  if (surface !== "link-modal") {
    return false;
  }
  return plan !== "free" && plan !== undefined;
}

/** Valid QR download file extensions */
export type QrFileExtension = "png" | "svg" | "jpg" | "jpeg";

/**
 * Generate a standardized filename for QR code downloads.
 *
 * Naming patterns:
 * - Dynamic (with link key): `{domain}-{key}-qr-code.{ext}`
 * - Static (destination URL only): `{domain-slug}-qr-code.{ext}`
 * - Fallback: `qr-code.{ext}`
 *
 * @param mode - "dynamic" for short links, "static" for direct URLs
 * @param extension - File extension (png, svg, jpg, jpeg). Note: jpeg is normalized to jpg.
 * @param linkKey - Short link key (for dynamic mode)
 * @param linkDomain - Short link domain (for dynamic mode)
 * @param destinationUrl - Target URL (for static mode)
 */
export function buildQrFilename(options: {
  mode: "dynamic" | "static";
  extension: QrFileExtension;
  linkKey?: string;
  linkDomain?: string;
  destinationUrl?: string;
}): string {
  const { mode, linkKey, linkDomain, destinationUrl } = options;
  // Normalize jpeg to jpg for consistency
  const extension = options.extension === "jpeg" ? "jpg" : options.extension;

  if (mode === "dynamic" && linkKey) {
    // Dynamic: use link key (optionally with domain)
    const prefix = linkDomain ? `${linkDomain}-${linkKey}` : linkKey;
    return `${prefix}-qr-code.${extension}`;
  }

  if (mode === "static" && destinationUrl) {
    // Static: derive from destination URL
    try {
      const parsed = new URL(destinationUrl);
      const domain = parsed.hostname
        .replace(/^www\./, "")
        .split(".")[0]
        .replace(/[^a-z0-9-]/gi, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase();

      return `${domain || "qr-code"}-qr-code.${extension}`;
    } catch {
      return `qr-code.${extension}`;
    }
  }

  return `qr-code.${extension}`;
}
