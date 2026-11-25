import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";

it("expands background color oklab", () => {
  const result = expandShorthand("background", "oklab(60% 0.1 -0.1)");
  expect(result?.declarations["background-color"]).toBe("oklab(60% 0.1 -0.1)");
});
