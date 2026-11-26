import { expect, it } from "vitest";
import { expandShorthands, isShorthand, supportsTransform } from "../../src/index.js";

it("recognizes -webkit-line-clamp without rewriting unsupported constituents", () => {
  expect(isShorthand("-webkit-line-clamp")).toBe(true);
  expect(supportsTransform("-webkit-line-clamp")).toBe(false);
  const input = { "-webkit-line-clamp": "3" };
  expect(expandShorthands(input)).toEqual(input);
});
