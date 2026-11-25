import { expect, it } from "vitest";
import {
  collapseStyleDeclaration,
  collapseCss,
  collapseLonghands,
  collapseToShorthand,
  expandCss,
  expandShorthand,
  expandShorthands,
  getLonghands,
  getShorthands,
  isLonghand,
  isShorthand,
} from "../../src/index.js";

const margin = {
  "margin-top": "10px",
  "margin-right": "20px",
  "margin-bottom": "10px",
  "margin-left": "20px",
};

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
