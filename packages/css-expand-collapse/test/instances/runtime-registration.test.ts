import { expect, it } from "vitest";
import { createCssTransformer, isShorthand } from "../../src/index.js";

it("registers a shorthand without changing other instances", () => {
  const first = createCssTransformer();
  const second = createCssTransformer();
  first.registerShorthand("example-shorthand", { longhands: new Map([["margin-top", "0"]]), expand: (value) => ({ "margin-top": value }) });
  expect(first.expand({ "example-shorthand": "2px" })).toEqual({ "margin-top": "2px" });
  expect(second.isShorthand("example-shorthand")).toBe(false);
  expect(isShorthand("example-shorthand")).toBe(false);
  expect(first.unregisterShorthand("example-shorthand")).toBe(true);
  expect(first.isShorthand("example-shorthand")).toBe(false);
});
