import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";

it("expands background color color", () => {
  const result = expandShorthand("background", "color(display-p3 0.2 0.4 0.6)");
  expect(result?.declarations["background-color"]).toBe("color(display-p3 0.2 0.4 0.6)");
});
