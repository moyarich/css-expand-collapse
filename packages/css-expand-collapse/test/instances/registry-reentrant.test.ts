import { expect, it } from "vitest";
import { createCssTransformer } from "../../src/index.js";

it("rejects registration changes from a transformation callback and unlocks afterward", () => {
  const css = createCssTransformer();
  css.registerShorthand("example-size", {
    longhands: new Map([["margin-top", "0px"]]),
    expand(value) {
      expect(() => css.unregisterShorthand("example-size")).toThrow(/during a transformation/);
      return { "margin-top": value };
    },
  });
  expect(css.expand({ "example-size": "1px" })).toEqual({ "margin-top": "1px" });
  expect(css.unregisterShorthand("example-size")).toBe(true);
});
