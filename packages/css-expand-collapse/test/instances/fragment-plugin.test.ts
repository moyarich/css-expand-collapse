import { expect, it } from "vitest";
import { createCssTransformer } from "../../src/index.js";

it("uses instance registration in declaration fragment source maps", () => {
  const css = createCssTransformer();
  css.registerShorthand("example-size", {
    longhands: new Map([["margin-top", "0"]]),
    expand: (value) => ({ "margin-top": value }),
  });
  expect(css.transformDeclarationsWithSourceMap("example-size:2px", { mode: "expand" }).css).toBe("margin-top:2px");
});
