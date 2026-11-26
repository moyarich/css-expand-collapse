import { expect, it } from "vitest";
import { createCssTransformer } from "@moyarich/css-expand-collapse";
import { backgroundRepeatPlugin } from "../src/index.js";

it("registers and removes the individual background-repeat plugin", () => {
  const css = createCssTransformer({ plugins: [backgroundRepeatPlugin] });
  expect(css.expandShorthand("background-repeat", "round space")?.declarations).toEqual({
    "background-repeat-x": "round",
    "background-repeat-y": "space",
  });
  expect(css.removePlugin(backgroundRepeatPlugin.name)).toBe(true);
  expect(css.supportsExpand("background-repeat")).toBe(false);
  expect(css.isShorthand("background-repeat")).toBe(true);
});
