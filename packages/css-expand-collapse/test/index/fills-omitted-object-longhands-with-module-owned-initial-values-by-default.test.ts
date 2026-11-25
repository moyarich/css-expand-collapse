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

it("fills omitted object longhands with module-owned initial values by default", () => {
  expect(
    collapseToShorthand("inset", {
      top: "0",
      right: "0",
      bottom: "0",
    }),
  ).toEqual({
    property: "inset",
    value: "0 0 0 auto",
    declarations: {
      top: "0",
      right: "0",
      bottom: "0",
      left: "auto",
    },
    consumed: ["top", "right", "bottom"],
  });
});
