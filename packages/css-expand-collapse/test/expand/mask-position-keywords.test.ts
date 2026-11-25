import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";

it("expands mask position keywords", () => {
  const result = expandShorthand("mask", "linear-gradient(black, transparent) top right");
  expect(result?.declarations["mask-position"]).toBe("top right");
});
