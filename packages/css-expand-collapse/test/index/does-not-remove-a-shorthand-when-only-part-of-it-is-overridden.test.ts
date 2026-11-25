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

it("does not remove a shorthand when only part of it is overridden", () => {
  const css = collapseCss(`
    .example {
      inset: auto;
      top: 0px;
      right: 0px;
      bottom: 0px;
    }
  `);

  expect(css).toContain("inset:auto");
  expect(css).toContain("top:0px");
  expect(css).toContain("right:0px");
  expect(css).toContain("bottom:0px");
});
