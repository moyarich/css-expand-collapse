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

it("expands text-decoration regardless of component order", () => {
  expect(
    expandShorthand("text-decoration", "wavy underline purple 25%")
      ?.declarations,
  ).toEqual({
    "text-decoration-line": "underline",
    "text-decoration-style": "wavy",
    "text-decoration-color": "purple",
    "text-decoration-thickness": "25%",
  });
});
