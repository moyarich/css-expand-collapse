import { expect, it } from "vitest";
import { createCssTransformer } from "@moyarich/css-expand-collapse";
import experimentalShorthands from "../src/index.js";

it("rejects collapse of unequal repeat-axis layer counts", () => {
  const css = createCssTransformer({ plugins: [experimentalShorthands] });
  expect(css.collapseToShorthand("background-repeat", { "background-repeat-x": "repeat, space", "background-repeat-y": "round" })).toBeNull();
});
