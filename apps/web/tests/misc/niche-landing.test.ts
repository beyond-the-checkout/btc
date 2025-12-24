import { describe, expect, it } from "vitest";

import {
  NICHE_SLUGS,
  NicheSlug,
  RESERVED_SLUGS,
  isMarketingDomain,
  isNicheSlug,
} from "@dub/utils";
import { getNicheConfig, hasNicheConfig } from "@/lib/niches";

describe("isNicheSlug", () => {
  it('returns true for "restaurants"', () => {
    expect(isNicheSlug("restaurants")).toBe(true);
  });

  it("returns false for unknown slugs", () => {
    ["unknown", "foo", ""].forEach((slug) => {
      expect(isNicheSlug(slug)).toBe(false);
    });
  });

  it("narrows type for valid slugs", () => {
    const slug: string = "restaurants";

    if (!isNicheSlug(slug)) {
      throw new Error("Expected slug to be a valid niche slug");
    }

    const typedSlug: NicheSlug = slug;
    expect(typedSlug).toBe("restaurants");
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
  it("returns config for valid niche slug", () => {
    const config = getNicheConfig("restaurants");
    expect(config).toBeDefined();
    expect(config?.niche).toBe("restaurants");
  });

  it("returns undefined for unknown slugs", () => {
    const unknownSlug = "unknown" as unknown as NicheSlug;
    expect(getNicheConfig(unknownSlug)).toBeUndefined();
  });

  it("hasNicheConfig only matches slugs with configs", () => {
    expect(hasNicheConfig("restaurants")).toBe(true);
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