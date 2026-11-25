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

it("collapses compatible longhands even when unrelated declarations are between them", () => {
  const css = collapseCss(`
    .example {
      align-items: center;
      align-self: auto;
      color: rebeccapurple;
      justify-items: normal;
      flex-direction: column;
      flex-grow: 0;
      flex-wrap: nowrap;
    }
  `);

  expect(css).toContain("place-items:center normal");
  expect(css).toContain("align-self:auto");
  expect(css).toContain("color:rebeccapurple");
  expect(css).toContain("flex-flow:column nowrap");
  expect(css).toContain("flex-grow:0");
  expect(css).not.toContain("align-items");
  expect(css).not.toContain("justify-items");
  expect(css).not.toContain("flex-direction");
  expect(css).not.toContain("flex-wrap");
});
