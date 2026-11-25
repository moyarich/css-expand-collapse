import { expect, it } from "vitest";
import {
  SHORTHAND_PROPERTIES,
  expandShorthand,
  isShorthand,
  supportsTransform,
} from "../../src/index.js";
import { SHORTHAND_MODULES } from "../../src/registry/index.js";

it("derives a unique property list from shorthand module filenames", () => {
  expect(new Set(SHORTHAND_PROPERTIES).size).toBe(
    SHORTHAND_PROPERTIES.length,
  );
  expect(SHORTHAND_PROPERTIES).toContain("margin");
  expect(SHORTHAND_PROPERTIES).toContain("background");
  expect(SHORTHAND_PROPERTIES).toContain("all");
});
