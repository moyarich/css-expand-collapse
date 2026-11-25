import { expect, it } from "vitest";
import { collapseToShorthand } from "../../src/index.js";

it("collapses a partial margin object using margin-top's initial value", () => {
  expect(
    collapseToShorthand("margin", {
      "margin-right": "24px",
      "margin-bottom": "12px",
      "margin-left": "67px",
    }),
  ).toEqual({
    property: "margin",
    value: "0 24px 12px 67px",
    declarations: {
      "margin-top": "0",
      "margin-right": "24px",
      "margin-bottom": "12px",
      "margin-left": "67px",
    },
    consumed: ["margin-right", "margin-bottom", "margin-left"],
  });
});
