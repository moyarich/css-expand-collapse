import { expect, it } from "vitest";
import { createCssTransformer } from "../../src/index.js";

it("rejects a conflicting plugin without partially registering its shorthands", () => {
  const css = createCssTransformer();
  const module = { longhands: new Map([["margin-top", "0"]]) };
  expect(() => css.addPlugin({ name: "conflict", shorthands: { "example-size": module, margin: module } })).toThrow();
  expect(css.isShorthand("example-size")).toBe(false);
  css.addPlugin({ name: "example", shorthands: { "example-size": module } });
  expect(css.isShorthand("example-size")).toBe(true);
});
