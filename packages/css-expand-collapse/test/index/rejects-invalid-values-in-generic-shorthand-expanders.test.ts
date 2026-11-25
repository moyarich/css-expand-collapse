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

it("rejects invalid values in generic shorthand expanders", () => {
  expect(expandShorthand("margin", "garbage")).toBeNull();
  expect(expandShorthand("gap", "garbage")).toBeNull();
  expect(expandShorthand("container", "sidebar / garbage")).toBeNull();
});
