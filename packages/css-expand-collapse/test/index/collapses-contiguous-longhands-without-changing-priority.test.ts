import { expect, it } from "vitest";
import { collapseCss } from "../../src/index.js";

it("collapses contiguous longhands without changing priority", () => {
  const css = collapseCss(`
    .example {
      margin-top: 10px;
      margin-right: 20px;
      margin-bottom: 10px;
      margin-left: 20px;
    }
  `);
  expect(css).toContain("margin:10px 20px");
  expect(css).not.toContain("margin-top");
});
