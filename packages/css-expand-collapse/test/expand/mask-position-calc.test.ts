import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";

it("expands mask position calc", () => {
  const result = expandShorthand("mask", "linear-gradient(black, transparent) calc(100% - 10px) calc(50% + 2px)");
  expect(result?.declarations["mask-position"]).toBe("calc(100% - 10px) calc(50% + 2px)");
});
