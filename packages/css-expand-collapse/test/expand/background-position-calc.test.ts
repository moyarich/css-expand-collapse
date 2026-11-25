import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";

it("expands background position calc", () => {
  const result = expandShorthand("background", "linear-gradient(red, blue) calc(100% - 10px) calc(50% + 2px)");
  expect(result?.declarations["background-position"]).toBe("calc(100% - 10px) calc(50% + 2px)");
});
