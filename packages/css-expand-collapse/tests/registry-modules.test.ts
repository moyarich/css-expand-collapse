import { describe, expect, it } from "vitest";
import {
  SHORTHAND_PROPERTIES,
  expandShorthand,
  getShorthandStrategy,
  isShorthand,
  supportsTransform,
} from "../src/index.js";
import { SHORTHAND_DEFINITIONS } from "../src/registry.js";

describe("per-shorthand registry", () => {
  it("derives a unique property list from shorthand module filenames", () => {
    expect(new Set(SHORTHAND_PROPERTIES).size).toBe(SHORTHAND_PROPERTIES.length);
    expect(SHORTHAND_PROPERTIES).toContain("margin");
    expect(SHORTHAND_PROPERTIES).toContain("background");
    expect(SHORTHAND_PROPERTIES).toContain("all");
  });

  it("requires every transformable shorthand module to own expansion", () => {
    for (const definition of Object.values(SHORTHAND_DEFINITIONS)) {
      expect(typeof definition.expand).toBe("function");
    }
  });

  it("keeps all as metadata-only because it has no finite longhand set", () => {
    expect(isShorthand("all")).toBe(true);
    expect(supportsTransform("all")).toBe(false);
    expect(getShorthandStrategy("all")).toBeNull();
    expect(expandShorthand("all", "initial")).toBeNull();
  });
});
