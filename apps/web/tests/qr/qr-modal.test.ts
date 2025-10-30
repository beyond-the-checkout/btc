import { describe, expect, it } from "vitest";
import {
  DOT_TYPES,
  CORNER_SQUARE_TYPES,
  CORNER_DOT_TYPES,
  FRAME_TYPES,
} from "@/lib/qr/constants";
import { getQRData } from "@/lib/qr";

/**
 * Smoke tests for QR modal functionality
 * These tests verify basic data structures and logic without requiring full component rendering
 */

describe("QR Modal Smoke Tests", () => {
  const testUrl = "https://example.com";
  const testDomain = "example.com";
  const testKey = "test-key";

  describe("QR Code Design Data Structure", () => {
    it("should have all required pattern types available", () => {
      expect(DOT_TYPES).toContain("square");
      expect(DOT_TYPES).toContain("rounded");
      expect(DOT_TYPES).toContain("dots");
      expect(DOT_TYPES).toContain("classy");
      expect(DOT_TYPES).toContain("extra-rounded");
      expect(DOT_TYPES).toHaveLength(5);
    });

    it("should have all corner square types available", () => {
      expect(CORNER_SQUARE_TYPES).toContain("square");
      expect(CORNER_SQUARE_TYPES).toContain("rounded");
      expect(CORNER_SQUARE_TYPES).toContain("dots");
      expect(CORNER_SQUARE_TYPES).toContain("extra-rounded");
      expect(CORNER_SQUARE_TYPES).toContain("leaf");
      expect(CORNER_SQUARE_TYPES).toHaveLength(5);
    });

    it("should have all corner dot types available", () => {
      expect(CORNER_DOT_TYPES).toContain("square");
      expect(CORNER_DOT_TYPES).toContain("dots");
      expect(CORNER_DOT_TYPES).toContain("rounded");
      expect(CORNER_DOT_TYPES).toHaveLength(3);
    });

    it("should have all frame types available", () => {
      expect(FRAME_TYPES).toContain("none");
      expect(FRAME_TYPES).toContain("square");
      expect(FRAME_TYPES).toContain("rounded-square");
      expect(FRAME_TYPES).toContain("circle");
      expect(FRAME_TYPES).toContain("dots-circle");
      expect(FRAME_TYPES).toHaveLength(5);
    });
  });

  describe("QR Design State Updates", () => {
    it("should generate QR data with default design", () => {
      const qrData = getQRData({
        url: testUrl,
      });

      expect(qrData).toBeDefined();
      expect(qrData.value).toBe(`${testUrl}?qr=1`);
      expect(qrData.fgColor).toBeUndefined(); // Default falls back in getQRData
    });

    it("should generate QR data with custom dot pattern", () => {
      DOT_TYPES.forEach((dotType) => {
        const qrData = getQRData({
          url: testUrl,
          dotsOptions: { type: dotType },
        });

        expect(qrData.dotsOptions?.type).toBe(dotType);
      });
    });

    it("should generate QR data with custom corner patterns", () => {
      CORNER_SQUARE_TYPES.forEach((squareType) => {
        const qrData = getQRData({
          url: testUrl,
          eyeOptions: {
            cornerSquare: { type: squareType },
          },
        });

        expect(qrData.eyeOptions?.cornerSquare?.type).toBe(squareType);
      });

      CORNER_DOT_TYPES.forEach((dotType) => {
        const qrData = getQRData({
          url: testUrl,
          eyeOptions: {
            cornerDot: { type: dotType },
          },
        });

        expect(qrData.eyeOptions?.cornerDot?.type).toBe(dotType);
      });
    });

    it("should generate QR data with custom colors", () => {
      const colors = {
        fgColor: "#ff0000",
        dotsColor: "#00ff00",
        cornerSquareColor: "#0000ff",
        cornerDotColor: "#ffff00",
      };

      const qrData = getQRData({
        url: testUrl,
        fgColor: colors.fgColor,
        dotsOptions: { color: colors.dotsColor },
        eyeOptions: {
          cornerSquare: { color: colors.cornerSquareColor },
          cornerDot: { color: colors.cornerDotColor },
        },
      });

      expect(qrData.fgColor).toBe(colors.fgColor);
      expect(qrData.dotsOptions?.color).toBe(colors.dotsColor);
      expect(qrData.eyeOptions?.cornerSquare?.color).toBe(colors.cornerSquareColor);
      expect(qrData.eyeOptions?.cornerDot?.color).toBe(colors.cornerDotColor);
    });

    it("should generate QR data with frame options", () => {
      FRAME_TYPES.forEach((frameType) => {
        if (frameType === "none") {
          return; // Skip none as it means no frame
        }

        const qrData = getQRData({
          url: testUrl,
          frameOptions: {
            type: frameType,
            color: "#000000",
          },
        });

        expect(qrData.frameOptions?.type).toBe(frameType);
        expect(qrData.frameOptions?.color).toBe("#000000");
      });
    });

    it("should toggle QR shape between square and circle", () => {
      const squareQR = getQRData({
        url: testUrl,
        qrShape: "square",
      });

      const circleQR = getQRData({
        url: testUrl,
        qrShape: "circle",
      });

      expect(squareQR.qrShape).toBe("square");
      expect(circleQR.qrShape).toBe("circle");
    });

    it("should handle logo visibility toggle", () => {
      const withLogo = getQRData({
        url: testUrl,
        hideLogo: false,
      });

      const withoutLogo = getQRData({
        url: testUrl,
        hideLogo: true,
      });

      expect(withLogo.hideLogo).toBe(false);
      expect(withLogo.imageSettings).toBeDefined();
      expect(withoutLogo.hideLogo).toBe(true);
      expect(withoutLogo.imageSettings).toBeUndefined();
    });
  });

  describe("Color Validation", () => {
    const validHexColors = [
      "#000000",
      "#ffffff",
      "#FF0000",
      "#00ff00",
      "#0000FF",
      "#abc123",
    ];

    it("should accept valid hex colors", () => {
      validHexColors.forEach((color) => {
        const qrData = getQRData({
          url: testUrl,
          fgColor: color,
        });

        expect(qrData.fgColor).toBe(color);
      });
    });

    it("should handle case insensitive hex colors", () => {
      const upperCase = getQRData({
        url: testUrl,
        fgColor: "#FF0000",
      });

      const lowerCase = getQRData({
        url: testUrl,
        fgColor: "#ff0000",
      });

      expect(upperCase.fgColor).toBe("#FF0000");
      expect(lowerCase.fgColor).toBe("#ff0000");
    });
  });

  describe("QR Data Configuration", () => {
    it("should always append ?qr=1 query parameter to URL", () => {
      const urls = [
        "https://example.com",
        "https://example.com/path",
        "https://example.com?existing=param",
      ];

      urls.forEach((url) => {
        const qrData = getQRData({ url });
        expect(qrData.value).toBe(`${url}?qr=1`);
      });
    });

    it("should use correct default values", () => {
      const qrData = getQRData({ url: testUrl });

      expect(qrData.bgColor).toBe("#ffffff");
      expect(qrData.size).toBe(1024);
      expect(qrData.level).toBe("Q");
      expect(qrData.qrShape).toBe("square");
    });

    it("should use custom margin when provided", () => {
      const customMargin = 4;
      const qrData = getQRData({
        url: testUrl,
        margin: customMargin,
      });

      expect(qrData.margin).toBe(customMargin);
    });
  });

  describe("Pattern Selector Logic", () => {
    it("should iterate through all dot patterns", () => {
      const patterns: typeof DOT_TYPES[number][] = [];

      DOT_TYPES.forEach((pattern) => {
        patterns.push(pattern);
      });

      expect(patterns).toHaveLength(5);
      expect(patterns).toContain("square");
      expect(patterns).toContain("rounded");
      expect(patterns).toContain("dots");
      expect(patterns).toContain("classy");
      expect(patterns).toContain("extra-rounded");
    });

    it("should iterate through all corner patterns", () => {
      const squarePatterns: typeof CORNER_SQUARE_TYPES[number][] = [];
      const dotPatterns: typeof CORNER_DOT_TYPES[number][] = [];

      CORNER_SQUARE_TYPES.forEach((pattern) => {
        squarePatterns.push(pattern);
      });

      CORNER_DOT_TYPES.forEach((pattern) => {
        dotPatterns.push(pattern);
      });

      expect(squarePatterns).toHaveLength(5);
      expect(dotPatterns).toHaveLength(3);
    });

    it("should iterate through all frame types", () => {
      const frames: typeof FRAME_TYPES[number][] = [];

      FRAME_TYPES.forEach((frame) => {
        frames.push(frame);
      });

      expect(frames).toHaveLength(5);
      expect(frames).toContain("none");
    });
  });

  describe("Combined Customization Options", () => {
    it("should support all customization options simultaneously", () => {
      const qrData = getQRData({
        url: testUrl,
        fgColor: "#ff0000",
        hideLogo: false,
        margin: 3,
        qrShape: "circle",
        dotsOptions: {
          type: "rounded",
          color: "#00ff00",
        },
        eyeOptions: {
          cornerSquare: {
            type: "dots",
            color: "#0000ff",
          },
          cornerDot: {
            type: "rounded",
            color: "#ffff00",
          },
        },
        frameOptions: {
          type: "circle",
          color: "#ff00ff",
        },
      });

      expect(qrData.fgColor).toBe("#ff0000");
      expect(qrData.hideLogo).toBe(false);
      expect(qrData.margin).toBe(3);
      expect(qrData.qrShape).toBe("circle");
      expect(qrData.dotsOptions?.type).toBe("rounded");
      expect(qrData.dotsOptions?.color).toBe("#00ff00");
      expect(qrData.eyeOptions?.cornerSquare?.type).toBe("dots");
      expect(qrData.eyeOptions?.cornerSquare?.color).toBe("#0000ff");
      expect(qrData.eyeOptions?.cornerDot?.type).toBe("rounded");
      expect(qrData.eyeOptions?.cornerDot?.color).toBe("#ffff00");
      expect(qrData.frameOptions?.type).toBe("circle");
      expect(qrData.frameOptions?.color).toBe("#ff00ff");
    });

    it("should support minimal customization (only dot pattern)", () => {
      const qrData = getQRData({
        url: testUrl,
        dotsOptions: {
          type: "dots",
        },
      });

      expect(qrData.dotsOptions?.type).toBe("dots");
      // Other options should use defaults or be undefined
      expect(qrData.qrShape).toBe("square");
      expect(qrData.level).toBe("Q");
    });

    it("should support partial eye customization", () => {
      const onlySquare = getQRData({
        url: testUrl,
        eyeOptions: {
          cornerSquare: { type: "rounded" },
        },
      });

      const onlyDot = getQRData({
        url: testUrl,
        eyeOptions: {
          cornerDot: { type: "dots" },
        },
      });

      expect(onlySquare.eyeOptions?.cornerSquare?.type).toBe("rounded");
      expect(onlySquare.eyeOptions?.cornerDot).toBeUndefined();

      expect(onlyDot.eyeOptions?.cornerSquare).toBeUndefined();
      expect(onlyDot.eyeOptions?.cornerDot?.type).toBe("dots");
    });
  });
});
