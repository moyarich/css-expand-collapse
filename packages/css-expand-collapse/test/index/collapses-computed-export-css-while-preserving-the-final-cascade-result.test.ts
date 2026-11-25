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

it("collapses computed-export CSS while preserving the final cascade result", () => {
  const css = collapseCss(`
    .marker {
      inset: auto;
      top: 0px;
      right: 0px;
      bottom: 0px;
      left: 0px;
      margin: 0px;
      margin-top: 0px;
      margin-right: 0px;
      margin-bottom: 0px;
      margin-left: 0px;
      padding: 0px 0px 8px;
      padding-top: 0px;
      padding-right: 0px;
      padding-bottom: 8px;
      padding-left: 0px;
      border: 4px solid rgb(31, 111, 174);
      border-width: 4px;
      border-style: solid;
      border-color: rgb(31, 111, 174);
      border-top-width: 4px;
      border-right-width: 4px;
      border-bottom-width: 4px;
      border-left-width: 4px;
      border-top-style: solid;
      border-right-style: solid;
      border-bottom-style: solid;
      border-left-style: solid;
      border-top-color: rgb(31, 111, 174);
      border-right-color: rgb(31, 111, 174);
      border-bottom-color: rgb(31, 111, 174);
      border-left-color: rgb(31, 111, 174);
    }
  `);

  expect(css).toContain("inset:0px");
  expect(css).toContain("margin:0px");
  expect(css).toContain("padding:0px 0px 8px");
  expect(css).toContain("border:4px solid rgb(31,111,174)");
  expect(css).not.toContain("inset:auto");
  expect(css).not.toContain("margin-top");
  expect(css).not.toContain("padding-bottom");
  expect(css).not.toContain("border-width");
  expect(css).not.toContain("border-top-width");
});
