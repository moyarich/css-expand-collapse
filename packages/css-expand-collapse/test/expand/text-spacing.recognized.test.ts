import { expect, it } from "vitest";
import { expandShorthands, isShorthand, supportsTransform } from "../../src/index.js";

it("recognizes text-spacing without rewriting unsupported constituents", () => {
  expect(isShorthand("text-spacing")).toBe(true);
  expect(supportsTransform("text-spacing")).toBe(false);
  const input = { "text-spacing": "none" };
  expect(expandShorthands(input)).toEqual(input);
});
