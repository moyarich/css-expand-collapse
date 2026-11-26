import { expect, it } from "vitest";
import { createCssTransformer } from "../../src/index.js";

it("preserves background declarations mixed with explicit repeat axes", () => {
  const css = createCssTransformer();
  const source = "a{background:none;background-repeat-x:repeat}";
  expect(css.expandCss(source)).toBe(source);
  expect(css.collapseCss(source)).toBe(source);
});
