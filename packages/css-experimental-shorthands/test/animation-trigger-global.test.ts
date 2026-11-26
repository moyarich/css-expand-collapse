import { expect, it } from "vitest";
import { createCssTransformer } from "@moyarich/css-expand-collapse";
import { animationTriggerPlugin } from "@moyarich/css-experimental-shorthands";

it("includes the reset constituent in CSS-wide expansion and collapse", () => {
  const css = createCssTransformer();
  css.addPlugin(animationTriggerPlugin, { override: true });
  for (const keyword of ["inherit", "initial", "unset", "revert", "revert-layer"]) {
    const declarations = css.expandShorthand("animation", keyword)!.declarations;
    expect(declarations["animation-trigger"]).toBe(keyword);
    expect(css.collapseToShorthand("animation", declarations)?.value).toBe(keyword);
  }
});
