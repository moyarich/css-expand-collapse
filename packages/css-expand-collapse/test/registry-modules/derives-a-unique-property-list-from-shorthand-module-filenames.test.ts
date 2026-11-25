import { expect, it } from "vitest";
import { SHORTHAND_PROPERTIES } from "../../src/index.js";

it("derives a unique property list from shorthand module filenames", () => {
  expect(new Set(SHORTHAND_PROPERTIES).size).toBe(
    SHORTHAND_PROPERTIES.length,
  );
  expect(SHORTHAND_PROPERTIES).toContain("margin");
  expect(SHORTHAND_PROPERTIES).toContain("background");
  expect(SHORTHAND_PROPERTIES).toContain("all");
});
