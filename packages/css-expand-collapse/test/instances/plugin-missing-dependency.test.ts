import { expect, it } from "vitest";
import { createCssTransformer } from "../../src/index.js";

it("rejects an unsatisfied plugin dependency before installing contributions", () => {
  const css = createCssTransformer();
  expect(() => css.addPlugin({ name: "extra", requires: ["base"], shorthands: {
    "example-size": { longhands: new Map([["margin-top", "0"]]) },
  } })).toThrow();
  expect(css.hasPlugin("extra")).toBe(false);
  expect(css.isShorthand("example-size")).toBe(false);
});
