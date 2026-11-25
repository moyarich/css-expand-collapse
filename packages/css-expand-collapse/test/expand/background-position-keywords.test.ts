import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";

it("expands background position keywords", () => {
  const result = expandShorthand("background", "linear-gradient(red, blue) right bottom");
  expect(result?.declarations["background-position"]).toBe("right bottom");
});
