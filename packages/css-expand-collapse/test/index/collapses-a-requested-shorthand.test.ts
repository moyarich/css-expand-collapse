import { expect, it } from "vitest";
import { collapseToShorthand } from "../../src/index.js";

const margin = {
  "margin-top": "10px",
  "margin-right": "20px",
  "margin-bottom": "10px",
  "margin-left": "20px",
};

it("collapses a requested shorthand", () => {
  expect(collapseToShorthand("margin", margin)).toMatchObject({
    property: "margin",
    value: "10px 20px",
    declarations: margin,
    consumed: Object.keys(margin),
  });
});
