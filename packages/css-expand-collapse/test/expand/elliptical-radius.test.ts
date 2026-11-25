import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";

it("elliptical radius", () => {
  expect(expandShorthand("border-radius", "1px 2px / 3px 4px")?.declarations).toEqual({
    "border-top-left-radius": "1px 3px",
    "border-top-right-radius": "2px 4px",
    "border-bottom-right-radius": "1px 3px",
    "border-bottom-left-radius": "2px 4px",
  });
});
