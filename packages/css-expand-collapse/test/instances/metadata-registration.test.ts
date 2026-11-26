import { expect, it } from "vitest";
import { createCssTransformer, getShorthandMetadata } from "../../src/index.js";

it("reflects instance registrations in metadata discovery", () => {
  const css = createCssTransformer();
  css.registerShorthand("example-size", {
    longhands: new Map([["margin-top", "0"]]),
    expand: (value) => ({ "margin-top": value }),
    experimental: true,
  });
  expect(css.getShorthandMetadata("example-size")?.capabilities.expand).toBe(true);
  expect(css.listShorthands({ experimental: true, expand: true }).map((item) => item.property)).toContain("example-size");
  expect(getShorthandMetadata("example-size")).toBeUndefined();
  css.unregisterShorthand("example-size");
  expect(css.getShorthandMetadata("example-size")).toBeUndefined();
});
