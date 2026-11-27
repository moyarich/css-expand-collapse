import { expect, it } from "vitest";
import { createCssTransformer } from "../../src/index.js";
import { backgroundRepeatPlugin } from "../../../css-experimental-shorthands/src/background-repeat.js";
import { expectEquivalent } from "./helpers.js";

it("preserves overlapping background and repeat declarations under the experimental plugin", () => {
  const css = createCssTransformer({ plugins: [backgroundRepeatPlugin] });
  const source = ".target{background:linear-gradient(red,blue) repeat-x;background-repeat:space round!important}";
  const expanded = css.expandCss(source);
  const collapsed = css.collapseCss(source);
  expect(expanded).toContain("background:");
  expect(expanded).toContain("background-repeat:");
  expectEquivalent(source, expanded);
  expectEquivalent(source, collapsed);
});
