import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";

it("expands background color lch", () => {
  const result = expandShorthand("background", "lch(50% 40 270)");
  expect(result?.declarations["background-color"]).toBe("lch(50% 40 270)");
});
