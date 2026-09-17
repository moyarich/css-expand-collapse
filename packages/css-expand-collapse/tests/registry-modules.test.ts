import { describe, expect, it } from "vitest";
import {
  SHORTHAND_PROPERTIES,
  expandShorthand,
  isShorthand,
  supportsTransform,
} from "../src/index.js";
import { SHORTHAND_MODULES } from "../src/registry/index.js";

describe("per-shorthand registry", () => {
  it("derives a unique property list from shorthand module filenames", () => {
    expect(new Set(SHORTHAND_PROPERTIES).size).toBe(SHORTHAND_PROPERTIES.length);
    expect(SHORTHAND_PROPERTIES).toContain("margin");
    expect(SHORTHAND_PROPERTIES).toContain("background");
    expect(SHORTHAND_PROPERTIES).toContain("all");
  });

  it("requires every shorthand file to own expand and collapse behavior", () => {
    for (const module of Object.values(SHORTHAND_MODULES)) {
      expect(module.longhands).toBeInstanceOf(Map);
      expect([...module.longhands.keys()].every((value) => typeof value === "string")).toBe(true);
      expect([...module.longhands.values()].every((value) => typeof value === "string")).toBe(true);
      expect("initialValues" in module).toBe(false);
      expect(typeof module.expand).toBe("function");
      expect(typeof module.collapse).toBe("function");
      expect("strategy" in module).toBe(false);
    }
  });

  it("keeps all recognized but non-transformable", () => {
    expect([...SHORTHAND_MODULES.all.longhands]).toEqual([]);
    expect(typeof SHORTHAND_MODULES.all.expand).toBe("function");
    expect(typeof SHORTHAND_MODULES.all.collapse).toBe("function");
    expect(isShorthand("all")).toBe(true);
    expect(supportsTransform("all")).toBe(false);
    expect(expandShorthand("all", "initial")).toBeNull();
  });
});
