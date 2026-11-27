import { expect, it } from "vitest";
import { createCssTransformer } from "../../src/index.js";
import { backgroundRepeatPlugin } from "../../../css-experimental-shorthands/src/background-repeat.js";
import { expectEquivalent } from "./helpers.js";

it("compares actual plugin expansion and collapse of physical repeat layers with native CSS", ({ skip }) => {
  const css = createCssTransformer({ plugins: [backgroundRepeatPlugin] });
  const source = ".target{background-image:linear-gradient(red,blue),linear-gradient(blue,red);background-repeat:repeat-x,space round}";
  const expanded = css.expandCss(source);
  expect(expanded).toContain("background-repeat-x:repeat,space");
  expect(expanded).toContain("background-repeat-y:no-repeat,round");
  const collapsed = css.collapseCss(expanded);
  expect(collapsed).toContain("background-repeat:");
  if (!CSS.supports("background-repeat-x", "repeat,space") || !CSS.supports("background-repeat-y", "no-repeat,round")) {
    skip("Browser does not expose physical repeat axes");
    return;
  }
  expectEquivalent(source, expanded);
  expectEquivalent(source, collapsed);
});
