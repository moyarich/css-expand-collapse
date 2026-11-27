import { expect, it } from "vitest";
import { createCssTransformer } from "../../src/index.js";

it("parses layers with the instance's registered grammar and expander", () => {
  const css = createCssTransformer({ plugins: [{ name: "example", grammars: { "example-size": (value) => value === "1px, 2px" }, shorthands: {
    "example-size": { longhands: new Map([["example-width", "0px"]]), expand: (value) => ({ "example-width": value }) },
  } }] });
  expect(css.parseCssLayers("example-size", "1px, 2px").declarations).toEqual({ "example-width": "1px, 2px" });
  expect(createCssTransformer().parseCssLayers("example-size", "1px, 2px").declarations).toBeNull();
});
