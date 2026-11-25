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

it("does not fill missing partial values across an earlier shorthand", () => {
  const css = collapseCss(
    `
    .example {
      inset: 1px 2px 3px 4px;
      top: 0;
      right: 0;
      bottom: 0;
    }
  `,
    {
      fillMissingLonghands: "initial",
    },
  );

  expect(css).toContain("inset:1px 2px 3px 4px");
  expect(css).toContain("top:0");
  expect(css).toContain("right:0");
  expect(css).toContain("bottom:0");
});
