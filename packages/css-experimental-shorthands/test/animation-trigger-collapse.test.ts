import { expect, it } from "vitest";
import { createCssTransformer } from "@moyarich/css-expand-collapse";
import { animationTriggerPlugin } from "@moyarich/css-experimental-shorthands";

it("collapses only compatible reset values", () => {
  const css = createCssTransformer();
  css.addPlugin(animationTriggerPlugin, { override: true });
  const declarations = css.expandShorthand("animation", "1s ease fade")!.declarations;
  expect(css.collapseToShorthand("animation", declarations)?.consumed).toContain("animation-trigger");
  expect(css.collapseToShorthand("animation", { ...declarations, "animation-trigger": "--reveal play" })).toBeNull();
});
