import { expect, it } from "vitest";
import { createCssTransformer } from "@moyarich/css-expand-collapse";
import { backgroundRepeatPlugin } from "../src/index.js";

it("accepts case-insensitive physical repeat keywords during collapse", () => {
  const css = createCssTransformer({ plugins: [backgroundRepeatPlugin] });
  expect(css.collapseToShorthand("background-repeat", {
    "background-repeat-x": "ROUND",
    "background-repeat-y": "Space",
  })?.value).toBe("round space");
});
