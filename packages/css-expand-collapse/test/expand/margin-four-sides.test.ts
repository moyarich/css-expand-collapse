import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";

it("margin four sides", () => {
  expect(expandShorthand("margin", "1px 2px 3px 4px")?.declarations).toEqual({
    "margin-top": "1px",
    "margin-right": "2px",
    "margin-bottom": "3px",
    "margin-left": "4px",
  });
});
