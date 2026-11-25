import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";

it("system font", () => {
  expect(expandShorthand("font", "caption")).toBeNull();
});
