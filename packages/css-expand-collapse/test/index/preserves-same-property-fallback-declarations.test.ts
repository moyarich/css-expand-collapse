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

it("preserves same-property fallback declarations", () => {
  const css = collapseCss(`
    .example {
      display: -webkit-box;
      display: flex;
    }
  `);

  expect(css).toContain("display:-webkit-box");
  expect(css).toContain("display:flex");
});
