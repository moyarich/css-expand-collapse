import { expect, it } from "vitest";
import { expandShorthands, isShorthand, supportsTransform } from "../../src/index.js";

it("recognizes timeline-trigger-active-range without rewriting unsupported constituents", () => {
  expect(isShorthand("timeline-trigger-active-range")).toBe(true);
  expect(supportsTransform("timeline-trigger-active-range")).toBe(false);
  const input = { "timeline-trigger-active-range": "none" };
  expect(expandShorthands(input)).toEqual(input);
});
