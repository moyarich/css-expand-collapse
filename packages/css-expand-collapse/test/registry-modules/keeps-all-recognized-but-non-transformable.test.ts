import { expect, it } from "vitest";
import { expandShorthand, isShorthand, supportsTransform } from "../../src/index.js";
import { SHORTHAND_MODULES } from "../../src/registry/index.js";

it("keeps all recognized but non-transformable", () => {
  expect([...SHORTHAND_MODULES.all.longhands]).toEqual([]);
  expect(typeof SHORTHAND_MODULES.all.expand).toBe("function");
  expect(typeof SHORTHAND_MODULES.all.collapse).toBe("function");
  expect(isShorthand("all")).toBe(true);
  expect(supportsTransform("all")).toBe(false);
  expect(expandShorthand("all", "initial")).toBeNull();
});
