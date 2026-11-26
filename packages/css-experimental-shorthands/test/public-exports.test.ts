import { expect, it } from "vitest";
import { createCssTransformer } from "@moyarich/css-expand-collapse";
import experimentalShorthands, { backgroundRepeat, backgroundRepeatGrammars, backgroundRepeatPlugin } from "@moyarich/css-experimental-shorthands";

it("exposes the built package plugin and selective module through public exports", () => {
  expect(backgroundRepeatPlugin.shorthands?.["background-repeat"]).toBe(backgroundRepeat);
  expect(backgroundRepeatPlugin.grammars).toBe(backgroundRepeatGrammars);
  const css = createCssTransformer({ plugins: [experimentalShorthands] });
  expect(css.expandShorthand("background-repeat", "repeat-x")?.declarations).toEqual({
    "background-repeat-x": "repeat",
    "background-repeat-y": "no-repeat",
  });
});
