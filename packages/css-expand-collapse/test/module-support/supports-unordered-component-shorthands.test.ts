import { expect, it } from "vitest";
import {
  collapseToShorthand,
  expandShorthand,
  supportsTransform,
} from "../../src/index.js";

it("supports unordered component shorthands", () => {
  expect(expandShorthand("columns", "18rem 3")?.declarations).toEqual({
    "column-width": "18rem",
    "column-count": "3",
  });

  expect(
    collapseToShorthand("columns", {
      "column-width": "18rem",
      "column-count": "3",
    })?.value,
  ).toBe("18rem 3");
});
