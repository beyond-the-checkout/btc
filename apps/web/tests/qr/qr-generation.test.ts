import { describe, expect, it } from "vitest";
import {
  getQRData,
  generatePath,
  excavateModules,
  getCircularBorderParams,
} from "@/lib/qr";
import { detectEyes } from "@/lib/qr/eye-detector";
import qrcodegen from "@/lib/qr/codegen";
import { ERROR_LEVEL_MAP, DOT_TYPES, CORNER_SQUARE_TYPES, CORNER_DOT_TYPES, FRAME_TYPES } from "@/lib/qr/constants";
import type { Modules } from "@/lib/qr/types";

describe("QR Code Generation Library", () => {
  const testUrl = "https://example.com";
  const margin = 2;

  // Helper to generate QR modules for testing
  const generateTestModules = (url: string, level: string = "L"): Modules => {
    return qrcodegen.QrCode.encodeText(url, ERROR_LEVEL_MAP[level]).getModules();
  };

  describe("getQRData", () => {
    it("should return correct QR configuration with minimal params", () => {
      const result = getQRData({ url: testUrl });

      expect(result.value).toBe(`${testUrl}?qr=1`);
      expect(result.bgColor).toBe("#ffffff");
      expect(result.size).toBe(1024);
      expect(result.level).toBe("Q");
      expect(result.qrShape).toBe("square");
      expect(result.imageSettings).toBeDefined();
      expect(result.imageSettings?.excavate).toBe(true);
    });

    it("should respect custom foreground color", () => {
      const result = getQRData({ url: testUrl, fgColor: "#ff0000" });

      expect(result.fgColor).toBe("#ff0000");
    });

    it("should hide logo when requested", () => {
      const result = getQRData({ url: testUrl, hideLogo: true });

      expect(result.hideLogo).toBe(true);
      expect(result.imageSettings).toBeUndefined();
    });

    it("should support circle QR shape", () => {
      const result = getQRData({ url: testUrl, qrShape: "circle" });

      expect(result.qrShape).toBe("circle");
    });

    it("should support custom margin", () => {
      const result = getQRData({ url: testUrl, margin: 4 });

      expect(result.margin).toBe(4);
    });

    it("should pass through dotsOptions", () => {
      const dotsOptions = { type: "rounded" as const, color: "#0000ff" };
      const result = getQRData({ url: testUrl, dotsOptions });

      expect(result.dotsOptions).toEqual(dotsOptions);
    });

    it("should pass through eyeOptions", () => {
      const eyeOptions = {
        cornerSquare: { type: "rounded" as const, color: "#00ff00" },
        cornerDot: { type: "dots" as const, color: "#ff00ff" }
      };
      const result = getQRData({ url: testUrl, eyeOptions });

      expect(result.eyeOptions).toEqual(eyeOptions);
    });

    it("should pass through frameOptions", () => {
      const frameOptions = { type: "circle" as const, color: "#000000" };
      const result = getQRData({ url: testUrl, frameOptions });

      expect(result.frameOptions).toEqual(frameOptions);
    });
  });

  describe("detectEyes", () => {
    it("should detect exactly 3 eyes", () => {
      const modules = generateTestModules(testUrl);
      const eyes = detectEyes(modules);

      expect(eyes).toHaveLength(3);
    });

    it("should detect eyes at correct positions", () => {
      const modules = generateTestModules(testUrl);
      const eyes = detectEyes(modules);
      const moduleCount = modules.length;
      const eyeSize = 7;

      // Top-left eye
      const topLeft = eyes.find(e => e.corner === "top-left");
      expect(topLeft).toBeDefined();
      expect(topLeft?.x).toBe(0);
      expect(topLeft?.y).toBe(0);
      expect(topLeft?.size).toBe(eyeSize);

      // Top-right eye
      const topRight = eyes.find(e => e.corner === "top-right");
      expect(topRight).toBeDefined();
      expect(topRight?.x).toBe(moduleCount - eyeSize);
      expect(topRight?.y).toBe(0);
      expect(topRight?.size).toBe(eyeSize);

      // Bottom-left eye
      const bottomLeft = eyes.find(e => e.corner === "bottom-left");
      expect(bottomLeft).toBeDefined();
      expect(bottomLeft?.x).toBe(0);
      expect(bottomLeft?.y).toBe(moduleCount - eyeSize);
      expect(bottomLeft?.size).toBe(eyeSize);
    });
  });

  describe("generatePath", () => {
    it("should generate valid SVG path for square pattern", () => {
      const modules = generateTestModules(testUrl);
      const path = generatePath(modules, margin, "square");

      expect(path).toBeTruthy();
      expect(typeof path).toBe("string");
      expect(path.length).toBeGreaterThan(0);
      // Square pattern uses M (move) and h/v/H/V/z commands
      expect(path).toMatch(/M[\d\s,]+/);
    });

    it("should generate paths for all 5 dot types without errors", () => {
      const modules = generateTestModules(testUrl);

      DOT_TYPES.forEach(dotType => {
        const path = generatePath(modules, margin, dotType);

        expect(path).toBeTruthy();
        expect(typeof path).toBe("string");
        expect(path.length).toBeGreaterThan(0);
      });
    });

    it("should respect eyes parameter and exclude eye regions", () => {
      const modules = generateTestModules(testUrl);
      const eyes = detectEyes(modules);
      const pathWithEyes = generatePath(modules, margin, "square", eyes);
      const pathWithoutEyes = generatePath(modules, margin, "square", []);

      // Path with eyes excluded should be different (typically shorter)
      expect(pathWithEyes).toBeTruthy();
      expect(pathWithoutEyes).toBeTruthy();
      expect(pathWithEyes).not.toBe(pathWithoutEyes);
    });

    it("should generate different paths for different dot types", () => {
      const modules = generateTestModules(testUrl);
      const squarePath = generatePath(modules, margin, "square");
      const roundedPath = generatePath(modules, margin, "rounded");
      const dotsPath = generatePath(modules, margin, "dots");

      expect(squarePath).not.toBe(roundedPath);
      expect(squarePath).not.toBe(dotsPath);
      expect(roundedPath).not.toBe(dotsPath);
    });
  });

  describe("excavateModules", () => {
    it("should excavate a rectangular area correctly", () => {
      const modules = generateTestModules(testUrl);
      const moduleCount = modules.length;
      const excavation = {
        x: Math.floor(moduleCount / 2) - 5,
        y: Math.floor(moduleCount / 2) - 5,
        w: 10,
        h: 10
      };

      const excavated = excavateModules(modules, excavation);

      // Check that excavated area is cleared
      for (let y = excavation.y; y < excavation.y + excavation.h; y++) {
        for (let x = excavation.x; x < excavation.x + excavation.w; x++) {
          expect(excavated[y][x]).toBe(false);
        }
      }
    });

    it("should not modify modules outside excavation area", () => {
      const modules = generateTestModules(testUrl);
      const excavation = { x: 10, y: 10, w: 5, h: 5 };

      const excavated = excavateModules(modules, excavation);

      // Check corner modules (definitely outside excavation)
      expect(excavated[0][0]).toBe(modules[0][0]);
      expect(excavated[0][modules[0].length - 1]).toBe(modules[0][modules[0].length - 1]);
      expect(excavated[modules.length - 1][0]).toBe(modules[modules.length - 1][0]);
    });

    it("should return a new array (not mutate original)", () => {
      const modules = generateTestModules(testUrl);
      const original = modules.map(row => [...row]); // Deep copy
      const excavation = { x: 5, y: 5, w: 3, h: 3 };

      excavateModules(modules, excavation);

      // Original should be unchanged
      expect(modules).toEqual(original);
    });
  });

  describe("getCircularBorderParams", () => {
    it("should calculate border parameters correctly", () => {
      const modules = generateTestModules(testUrl);
      const numCells = modules.length + margin * 2;
      const params = getCircularBorderParams(numCells, margin);

      expect(params.center).toBe(numCells / 2);
      expect(params.qrRadius).toBe((numCells - margin * 2) / 2);
      expect(params.qrDiagonalRadius).toBeCloseTo(params.qrRadius * Math.sqrt(2));
      expect(params.circleRadius).toBeCloseTo(params.qrDiagonalRadius * 1.15);
      expect(params.dotSize).toBe(0.9);
      expect(params.dotRadius).toBe(0.45);
      expect(params.gridSize).toBeGreaterThan(0);
      expect(params.gridOffset).toBeGreaterThan(0);
    });

    it("should scale proportionally with different cell counts", () => {
      const smallModules = generateTestModules("test", "L");
      const largeModules = generateTestModules(testUrl + "/very/long/path/to/increase/qr/size", "L");

      const smallCells = smallModules.length + margin * 2;
      const largeCells = largeModules.length + margin * 2;

      const smallParams = getCircularBorderParams(smallCells, margin);
      const largeParams = getCircularBorderParams(largeCells, margin);

      // Larger QR should have larger circle radius
      expect(largeParams.circleRadius).toBeGreaterThan(smallParams.circleRadius);
      expect(largeParams.gridSize).toBeGreaterThan(smallParams.gridSize);
    });
  });

  describe("Dot Pattern Types", () => {
    it("should render square pattern", () => {
      const modules = generateTestModules(testUrl);
      const path = generatePath(modules, margin, "square");
      expect(path).toBeTruthy();
    });

    it("should render rounded pattern", () => {
      const modules = generateTestModules(testUrl);
      const path = generatePath(modules, margin, "rounded");
      expect(path).toBeTruthy();
    });

    it("should render dots pattern", () => {
      const modules = generateTestModules(testUrl);
      const path = generatePath(modules, margin, "dots");
      expect(path).toBeTruthy();
    });

    it("should render classy pattern", () => {
      const modules = generateTestModules(testUrl);
      const path = generatePath(modules, margin, "classy");
      expect(path).toBeTruthy();
    });

    it("should render extra-rounded pattern", () => {
      const modules = generateTestModules(testUrl);
      const path = generatePath(modules, margin, "extra-rounded");
      expect(path).toBeTruthy();
    });
  });

  describe("Error Correction Levels", () => {
    it("should support L (Low) error correction", () => {
      const modules = qrcodegen.QrCode.encodeText(testUrl, ERROR_LEVEL_MAP.L).getModules();
      expect(modules).toBeTruthy();
      expect(modules.length).toBeGreaterThan(0);
    });

    it("should support M (Medium) error correction", () => {
      const modules = qrcodegen.QrCode.encodeText(testUrl, ERROR_LEVEL_MAP.M).getModules();
      expect(modules).toBeTruthy();
      expect(modules.length).toBeGreaterThan(0);
    });

    it("should support Q (Quartile) error correction", () => {
      const modules = qrcodegen.QrCode.encodeText(testUrl, ERROR_LEVEL_MAP.Q).getModules();
      expect(modules).toBeTruthy();
      expect(modules.length).toBeGreaterThan(0);
    });

    it("should support H (High) error correction", () => {
      const modules = qrcodegen.QrCode.encodeText(testUrl, ERROR_LEVEL_MAP.H).getModules();
      expect(modules).toBeTruthy();
      expect(modules.length).toBeGreaterThan(0);
    });

    it("should produce larger QR codes with higher error correction", () => {
      const modulesL = qrcodegen.QrCode.encodeText(testUrl, ERROR_LEVEL_MAP.L).getModules();
      const modulesH = qrcodegen.QrCode.encodeText(testUrl, ERROR_LEVEL_MAP.H).getModules();

      // Higher error correction requires more modules
      expect(modulesH.length).toBeGreaterThanOrEqual(modulesL.length);
    });
  });

  describe("QR Shape Support", () => {
    it("should support square shape in getQRData", () => {
      const result = getQRData({ url: testUrl, qrShape: "square" });
      expect(result.qrShape).toBe("square");
    });

    it("should support circle shape in getQRData", () => {
      const result = getQRData({ url: testUrl, qrShape: "circle" });
      expect(result.qrShape).toBe("circle");
    });

    it("should default to square shape", () => {
      const result = getQRData({ url: testUrl });
      expect(result.qrShape).toBe("square");
    });
  });

  describe("Color Customization", () => {
    it("should accept valid hex colors", () => {
      const result = getQRData({
        url: testUrl,
        fgColor: "#ff0000",
        dotsOptions: { color: "#00ff00" },
        eyeOptions: {
          cornerSquare: { color: "#0000ff" },
          cornerDot: { color: "#ffff00" }
        }
      });

      expect(result.fgColor).toBe("#ff0000");
      expect(result.dotsOptions?.color).toBe("#00ff00");
      expect(result.eyeOptions?.cornerSquare?.color).toBe("#0000ff");
      expect(result.eyeOptions?.cornerDot?.color).toBe("#ffff00");
    });
  });

  describe("Corner Pattern Types", () => {
    it("should support all corner square types", () => {
      CORNER_SQUARE_TYPES.forEach(type => {
        const result = getQRData({
          url: testUrl,
          eyeOptions: {
            cornerSquare: { type }
          }
        });

        expect(result.eyeOptions?.cornerSquare?.type).toBe(type);
      });
    });

    it("should support all corner dot types", () => {
      CORNER_DOT_TYPES.forEach(type => {
        const result = getQRData({
          url: testUrl,
          eyeOptions: {
            cornerDot: { type }
          }
        });

        expect(result.eyeOptions?.cornerDot?.type).toBe(type);
      });
    });
  });

  describe("Frame Types", () => {
    it("should support all frame types", () => {
      FRAME_TYPES.forEach(type => {
        const result = getQRData({
          url: testUrl,
          frameOptions: { type }
        });

        expect(result.frameOptions?.type).toBe(type);
      });
    });
  });

  describe("Logo Embedding", () => {
    it("should include logo settings by default", () => {
      const result = getQRData({ url: testUrl });

      expect(result.imageSettings).toBeDefined();
      expect(result.imageSettings?.src).toBeTruthy();
      expect(result.imageSettings?.height).toBe(256);
      expect(result.imageSettings?.width).toBe(256);
      expect(result.imageSettings?.excavate).toBe(true);
    });

    it("should use custom logo when provided", () => {
      const customLogo = "https://example.com/logo.png";
      const result = getQRData({ url: testUrl, logo: customLogo });

      expect(result.imageSettings?.src).toBe(customLogo);
    });

    it("should properly excavate modules for logo placement", () => {
      const modules = generateTestModules(testUrl);
      const moduleCount = modules.length;
      const centerX = Math.floor(moduleCount / 2) - 5;
      const centerY = Math.floor(moduleCount / 2) - 5;
      const excavation = { x: centerX, y: centerY, w: 10, h: 10 };

      const excavated = excavateModules(modules, excavation);

      // Verify center area is cleared
      const centerModule = excavated[Math.floor(moduleCount / 2)][Math.floor(moduleCount / 2)];
      expect(centerModule).toBe(false);
    });
  });
});
