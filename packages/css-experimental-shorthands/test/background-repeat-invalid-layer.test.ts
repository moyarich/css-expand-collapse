import { expect, it } from "vitest";
import { createCssTransformer } from "@moyarich/css-expand-collapse";
import { backgroundRepeatPlugin } from "../src/index.js";

it("preserves a shorthand containing an empty repeat layer", () => {
  const css = createCssTransformer({ plugins: [backgroundRepeatPlugin] });
  expect(css.expand({ "background-repeat": "repeat-x, " })).toEqual({ "background-repeat": "repeat-x, " });
});
