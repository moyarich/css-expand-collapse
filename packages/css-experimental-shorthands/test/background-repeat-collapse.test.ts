import { expect, it } from "vitest";
import { createCssTransformer } from "@moyarich/css-expand-collapse";
import experimentalShorthands from "../src/index.js";

it("collapses matching repeat layers without changing their physical axes", () => {
  const css = createCssTransformer({ plugins: [experimentalShorthands] });
  const axes = { "background-repeat-x": "repeat, no-repeat", "background-repeat-y": "no-repeat, repeat" };
  const result = css.collapseToShorthand("background-repeat", axes, { fillMissingLonghands: false });
  expect(result?.value).toBe("repeat no-repeat, no-repeat repeat");
  expect(css.expandShorthand("background-repeat", result!.value)?.declarations).toEqual(axes);
});
