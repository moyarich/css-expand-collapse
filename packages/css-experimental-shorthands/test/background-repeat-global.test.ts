import { expect, it } from "vitest";
import { createCssTransformer } from "@moyarich/css-expand-collapse";
import { backgroundRepeatPlugin } from "../src/index.js";

it("round trips a CSS-wide keyword through both axes", () => {
  const css = createCssTransformer({ plugins: [backgroundRepeatPlugin] });
  const axes = { "background-repeat-x": "revert-layer", "background-repeat-y": "revert-layer" };
  expect(css.expandShorthand("background-repeat", "revert-layer")?.declarations).toEqual(axes);
  expect(css.collapseToShorthand("background-repeat", axes)?.value).toBe("revert-layer");
});
