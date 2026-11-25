import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";

it("expands mask position percentages", () => {
  const result = expandShorthand("mask", "linear-gradient(black, transparent) 20% 80%");
  expect(result?.declarations["mask-position"]).toBe("20% 80%");
});
