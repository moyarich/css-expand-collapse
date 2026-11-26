import { expect, it } from "vitest";
import { createCssTransformer } from "@moyarich/css-expand-collapse";
import experimentalShorthands from "../src/index.js";

it("preserves overlapping repeat shorthand and axis declarations with priorities", () => {
  const css = createCssTransformer({ plugins: [experimentalShorthands] });
  const source = "a{background-repeat:repeat-x!important;background-repeat-y:round}";
  expect(css.expandCss(source)).toBe(source);
  expect(css.collapseCss(source)).toBe(source);
});
