import { expect, it } from "vitest";
import { expandShorthand, isShorthand, supportsTransform } from "../../src/index.js";

it("keeps all recognized but non-transformable", () => {
  expect(isShorthand("all")).toBe(true);
  expect(supportsTransform("all")).toBe(false);
  expect(expandShorthand("all", "initial")).toBeNull();
});
