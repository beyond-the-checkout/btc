import { nanoid } from "@dub/utils";
import { LinkDraft } from "@/ui/modals/link-builder/use-link-drafts";
import {
  DEFAULT_QR_CODE_DESIGN,
  QRCodeDesign,
} from "@/ui/modals/link-qr-modal.types";
import { LinkFormData } from "@/ui/links/link-builder/link-builder-provider";

/**
 * Base QR design matching the application's default QR design.
 * Cloned to avoid accidental mutation of the shared default constant.
 */
export const baseDesign: QRCodeDesign = { ...DEFAULT_QR_CODE_DESIGN };

/**
 * Create a QR design with color-related overrides merged into the base design.
 * Accepts any partial QRCodeDesign overrides for flexibility in tests.
 */
export function withColors(
  overrides: Partial<QRCodeDesign> = {},
): QRCodeDesign {
  return {
    ...baseDesign,
    ...overrides,
  };
}

/**
 * Create a QR design with a frame applied.
 * Sets hasFrame to true, applies the provided style, and an optional color
 * (defaults to black if not specified).
 */
export function withFrame(
  style: NonNullable<QRCodeDesign["qrFrameStyle"]>,
  color?: string,
): QRCodeDesign {
  return {
    ...baseDesign,
    hasFrame: true,
    qrFrameStyle: style,
    qrFrameColor: color ?? "#000000",
  };
}

/**
 * Build a LinkDraft with sensible defaults and optional overrides.
 * Defaults:
 * - id: nanoid()
 * - timestamp: Date.now()
 * - link: { domain: "dub.sh", key: "test", url: "https://example.com" }
 * - qrDesign: baseDesign
 */
export function makeDraft(overrides: Partial<LinkDraft> = {}): LinkDraft {
  const now = Date.now();
  const defaultLink: Partial<LinkFormData> = {
    domain: "dub.sh",
    key: "test",
    url: "https://example.com",
  };

  const defaultDraft: LinkDraft = {
    id: nanoid(),
    timestamp: now,
    link: defaultLink,
    qrDesign: baseDesign,
  };

  return {
    ...defaultDraft,
    ...overrides,
    link: {
      ...(defaultDraft.link || {}),
      ...(overrides.link || {}),
    },
    // If qrDesign is explicitly set to undefined in overrides, preserve that;
    // otherwise use the provided override or the default.
    qrDesign:
      "qrDesign" in overrides ? overrides.qrDesign : defaultDraft.qrDesign,
  };
}