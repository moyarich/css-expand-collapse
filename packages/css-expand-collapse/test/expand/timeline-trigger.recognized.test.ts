import { expect, it } from "vitest";
import { expandShorthands, isShorthand, supportsTransform } from "../../src/index.js";

it("recognizes timeline-trigger without rewriting unsupported constituents", () => {
  expect(isShorthand("timeline-trigger")).toBe(true);
  expect(supportsTransform("timeline-trigger")).toBe(false);
  const input = { "timeline-trigger": "--t1" };
  expect(expandShorthands(input)).toEqual(input);
});
