import { expect, it } from "vitest";
import { createCssTransformer } from "@moyarich/css-expand-collapse";
import experimentalShorthands from "../src/index.js";

it("expands physical repeat aliases only in an opted-in instance", () => {
  const css = createCssTransformer({ plugins: [experimentalShorthands] });
  expect(css.expandShorthand("background-repeat", "repeat-x, repeat-y")?.declarations).toEqual({
    "background-repeat-x": "repeat, no-repeat",
    "background-repeat-y": "no-repeat, repeat",
  });
  expect(createCssTransformer().supportsExpand("background-repeat")).toBe(false);
});
