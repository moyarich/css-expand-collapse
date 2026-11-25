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

it("can require a complete object declaration map", () => {
  expect(
    collapseToShorthand(
      "inset",
      {
        top: "0",
        right: "0",
        bottom: "0",
      },
      {
        fillMissingLonghands: false,
      },
    ),
  ).toBeNull();
});
