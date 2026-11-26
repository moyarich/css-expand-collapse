import { expect, it } from "vitest";
import { expandShorthands, isShorthand, supportsTransform } from "../../src/index.js";

it("recognizes event-trigger without rewriting unsupported constituents", () => {
  expect(isShorthand("event-trigger")).toBe(true);
  expect(supportsTransform("event-trigger")).toBe(false);
  const input = { "event-trigger": "none" };
  expect(expandShorthands(input)).toEqual(input);
});
