import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";

it("expands background position percentages", () => {
  const result = expandShorthand("background", "linear-gradient(red, blue) 25% 75%");
  expect(result?.declarations["background-position"]).toBe("25% 75%");
});
