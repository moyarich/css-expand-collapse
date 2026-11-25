import { expect, it } from "vitest";
import { collapseToShorthand } from "../../src/index.js";

it("mixed global keywords", () => {
  expect(collapseToShorthand("margin", {
    "margin-top": "inherit",
    "margin-right": "0",
    "margin-bottom": "0",
    "margin-left": "0",
  }, { fillMissingLonghands: false })).toBeNull();
});
