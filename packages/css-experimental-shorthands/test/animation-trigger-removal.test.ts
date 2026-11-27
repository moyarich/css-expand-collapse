import { expect, it } from "vitest";
import { createCssTransformer } from "@moyarich/css-expand-collapse";
import experimentalShorthands, { animationTriggerPlugin } from "@moyarich/css-experimental-shorthands";

it("requires an explicit override and restores the compatible default on removal", () => {
  const css = createCssTransformer({ plugins: [experimentalShorthands] });
  expect(() => css.addPlugin(animationTriggerPlugin)).toThrow();
  css.addPlugin(animationTriggerPlugin, { override: true });
  expect(css.expandShorthand("animation", "1s fade")?.declarations["animation-trigger"]).toBe("none");
  expect(createCssTransformer().expandShorthand("animation", "1s fade")?.declarations).not.toHaveProperty("animation-trigger");
  expect(css.removePlugin(animationTriggerPlugin.name)).toBe(true);
  expect(css.expandShorthand("animation", "1s fade")?.declarations).not.toHaveProperty("animation-trigger");
});
