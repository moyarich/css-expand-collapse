import { expect, it } from "vitest";
import { createCssTransformer, validateProperty } from "../../src/index.js";

it("uses local grammar predicates in source and property validation", () => {
  const css = createCssTransformer({ plugins: [{ name: "example", grammars: { "example-size": (value) => value === "large" } }] });
  expect(css.validateProperty("example-size", "large").valid).toBe(true);
  expect(css.validateProperty("example-size", "small").valid).toBe(false);
  expect(css.validateCss("a{example-size:large}").valid).toBe(true);
  expect(css.validateDeclarations("example-size:small").valid).toBe(false);
  expect(validateProperty("example-size", "large").valid).toBeNull();
});
