import { expect, it } from "vitest";
import { createCssTransformer, expandCss } from "../../src/index.js";

it("uses instance registrations in stylesheets without modifying the default transformer", () => {
  const css = createCssTransformer();
  css.registerShorthand("example-size", {
    longhands: new Map([["margin-top", "0"]]),
    expand: (value) => ({ "margin-top": value }),
  });
  expect(css.expandCss("a{example-size:2px}")).toBe("a{margin-top:2px}");
  expect(expandCss("a{example-size:2px}")).toBe("a{example-size:2px}");
});
