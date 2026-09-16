import { describe, expect, it } from "vitest";
import {
  SHORTHAND_PROPERTIES,
  expandShorthand,
  getShorthandStrategy,
  isShorthand,
  supportsTransform,
} from "../src/index.js";

describe("per-shorthand registry", () => {
  it("derives a unique property list from registered modules", () => {
    expect(new Set(SHORTHAND_PROPERTIES).size).toBe(SHORTHAND_PROPERTIES.length);
    expect(SHORTHAND_PROPERTIES).toContain("margin");
    expect(SHORTHAND_PROPERTIES).toContain("background");
    expect(SHORTHAND_PROPERTIES).toContain("all");
  });

  it("keeps all as metadata-only because it has no finite longhand set", () => {
    expect(isShorthand("all")).toBe(true);
    expect(supportsTransform("all")).toBe(false);
    expect(getShorthandStrategy("all")).toBeNull();
    expect(expandShorthand("all", "initial")).toBeNull();
  });
});
