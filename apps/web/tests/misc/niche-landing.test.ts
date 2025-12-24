import { describe, expect, it } from "vitest";

import { getNicheConfig, hasNicheConfig } from "@/lib/niches";
import {
  NICHE_SLUGS,
  NicheSlug,
  RESERVED_SLUGS,
  isMarketingDomain,
  isNicheSlug,
} from "@dub/utils";

describe("isNicheSlug", () => {
  it("returns true for valid niche slugs", () => {
    expect(isNicheSlug("restaurants")).toBe(true);
    expect(isNicheSlug("ecommerce")).toBe(true);
  });

  it("returns false for unknown slugs", () => {
    ["unknown", "foo", ""].forEach((slug) => {
      expect(isNicheSlug(slug)).toBe(false);
    });
  });

  it("narrows type for valid slugs", () => {
    const slugs: string[] = ["restaurants", "ecommerce"];

    slugs.forEach((slug) => {
      if (!isNicheSlug(slug)) {
        throw new Error(`Expected ${slug} to be a valid niche slug`);
      }
      const typedSlug: NicheSlug = slug;
      expect(typedSlug).toBe(slug);
    });
  });
});

describe("isMarketingDomain", () => {
  it("returns true for marketing domains", () => {
    expect(isMarketingDomain("chko.sh")).toBe(true);
    expect(isMarketingDomain("foreverqrs.com")).toBe(true);
  });

  it("returns false for non-marketing domains", () => {
    expect(isMarketingDomain("example.com")).toBe(false);
    expect(isMarketingDomain("app.chko.sh")).toBe(false);
  });
});

describe("niche configs", () => {
  it("returns config for valid niche slugs", () => {
    const restaurantsConfig = getNicheConfig("restaurants");
    expect(restaurantsConfig).toBeDefined();
    expect(restaurantsConfig?.niche).toBe("restaurants");

    const ecommerceConfig = getNicheConfig("ecommerce");
    expect(ecommerceConfig).toBeDefined();
    expect(ecommerceConfig?.niche).toBe("ecommerce");
  });

  it("returns undefined for unknown slugs", () => {
    const unknownSlug = "unknown" as unknown as NicheSlug;
    expect(getNicheConfig(unknownSlug)).toBeUndefined();
  });

  it("hasNicheConfig only matches slugs with configs", () => {
    expect(hasNicheConfig("restaurants")).toBe(true);
    expect(hasNicheConfig("ecommerce")).toBe(true);
    expect(hasNicheConfig("unknown")).toBe(false);
  });
});

describe("reserved slugs", () => {
  it("includes all niche slugs in RESERVED_SLUGS", () => {
    NICHE_SLUGS.forEach((slug) => {
      expect(RESERVED_SLUGS).toContain(slug);
    });
  });
});
