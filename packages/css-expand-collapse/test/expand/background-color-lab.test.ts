import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";

it("expands background color lab", () => {
  const result = expandShorthand("background", "lab(50% 40 -20)");
  expect(result?.declarations["background-color"]).toBe("lab(50% 40 -20)");
});
