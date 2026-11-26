import { expect, it } from "vitest";
import { expandShorthands, isShorthand, supportsTransform } from "../../src/index.js";

it("recognizes background-repeat without rewriting unsupported constituents", () => {
  expect(isShorthand("background-repeat")).toBe(true);
  expect(supportsTransform("background-repeat")).toBe(false);
  const input = { "background-repeat": "repeat-x, no-repeat" };
  expect(expandShorthands(input)).toEqual(input);
});
