import { expect, it } from "vitest";
import { collapseCss } from "../../src/index.js";

it("collapses a fully overridden margin shorthand", () => {
  const css = collapseCss(`
    .example {
      margin: auto;
      margin-top: 0px;
      margin-right: 0px;
      margin-bottom: 0px;
      margin-left: 0px;
    }
  `);

  expect(css).toContain("margin:0px");
  expect(css).not.toContain("margin:auto");
  expect(css).not.toContain("margin-top");
});
