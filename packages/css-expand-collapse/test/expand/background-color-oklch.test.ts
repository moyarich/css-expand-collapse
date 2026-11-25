import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";

it("expands background color oklch", () => {
  const result = expandShorthand("background", "oklch(60% 0.15 240)");
  expect(result?.declarations["background-color"]).toBe("oklch(60% 0.15 240)");
});
