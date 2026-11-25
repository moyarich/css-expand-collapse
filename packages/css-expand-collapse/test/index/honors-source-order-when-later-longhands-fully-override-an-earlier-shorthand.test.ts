import { expect, it } from "vitest";
import { collapseCss } from "../../src/index.js";

it("honors source order when later longhands fully override an earlier shorthand", () => {
  const css = collapseCss(`
    .marker {
      position: relative;
      inset: auto;
      top: 0px;
      right: 0px;
      bottom: 0px;
      left: 0px;
    }
  `);

  expect(css).toContain("position:relative");
  expect(css).toContain("inset:0px");
  expect(css).not.toContain("inset:auto");
  expect(css).not.toContain("top:0px");
  expect(css).not.toContain("right:0px");
  expect(css).not.toContain("bottom:0px");
  expect(css).not.toContain("left:0px");
});
