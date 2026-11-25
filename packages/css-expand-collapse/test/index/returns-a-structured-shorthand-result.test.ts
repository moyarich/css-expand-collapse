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

it("returns a structured shorthand result", () => {
  expect(expandShorthand("margin", "10px 20px")).toEqual({
    property: "margin",
    value: "10px 20px",
    declarations: {
      "margin-top": "10px",
      "margin-right": "20px",
      "margin-bottom": "10px",
      "margin-left": "20px",
    },
  });
});
