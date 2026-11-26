import { expect, it } from "vitest";
import { expandShorthands, isShorthand, supportsTransform } from "../../src/index.js";

it("recognizes timeline-trigger-activation-range without rewriting unsupported constituents", () => {
  expect(isShorthand("timeline-trigger-activation-range")).toBe(true);
  expect(supportsTransform("timeline-trigger-activation-range")).toBe(false);
  const input = { "timeline-trigger-activation-range": "none" };
  expect(expandShorthands(input)).toEqual(input);
});
