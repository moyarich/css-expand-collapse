import { expect, it } from "vitest";
import { expandShorthands, isShorthand, supportsTransform } from "../../src/index.js";

it("recognizes line-clamp without rewriting unsupported constituents", () => {
  expect(isShorthand("line-clamp")).toBe(true);
  expect(supportsTransform("line-clamp")).toBe(false);
  const input = { "line-clamp": "3" };
  expect(expandShorthands(input)).toEqual(input);
});
