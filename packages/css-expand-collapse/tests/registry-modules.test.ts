import { describe, expect, it } from "vitest";
import {
  SHORTHAND_PROPERTIES,
  expandShorthand,
  getShorthandStrategy,
  isShorthand,
  supportsTransform,
} from "../src/index.js";
import { SHORTHAND_MODULES } from "../src/registry.js";

describe("per-shorthand registry", () => {
  it("derives a unique property list from shorthand module filenames", () => {
    expect(new Set(SHORTHAND_PROPERTIES).size).toBe(SHORTHAND_PROPERTIES.length);
    expect(SHORTHAND_PROPERTIES).toContain("margin");
    expect(SHORTHAND_PROPERTIES).toContain("background");
    expect(SHORTHAND_PROPERTIES).toContain("all");
  });

  it("requires every shorthand file to satisfy the common module contract", () => {
    for (const module of Object.values(SHORTHAND_MODULES)) {
      expect(Array.isArray(module.longhands)).toBe(true);
      expect(module.strategy === null || typeof module.strategy === "string").toBe(true);
      expect(typeof module.expand).toBe("function");
    }
  });

  it("keeps all as a module while marking it non-transformable", () => {
    expect(SHORTHAND_MODULES.all).toMatchObject({
      longhands: [],
      strategy: null,
    });
    expect(typeof SHORTHAND_MODULES.all.expand).toBe("function");
    expect(isShorthand("all")).toBe(true);
    expect(supportsTransform("all")).toBe(false);
    expect(getShorthandStrategy("all")).toBeNull();
    expect(expandShorthand("all", "initial")).toBeNull();
  });
});
