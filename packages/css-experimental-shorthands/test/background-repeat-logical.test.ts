import { expect, it } from "vitest";
import { createCssTransformer } from "@moyarich/css-expand-collapse";
import experimentalShorthands from "../src/index.js";

it("preserves logical repeat aliases rather than guessing a physical axis", () => {
  const css = createCssTransformer();
  css.addPlugin(experimentalShorthands, { override: true });
  expect(css.expandShorthand("background-repeat", "repeat-block")).toBeNull();
});
