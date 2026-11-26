import { expect, it } from "vitest";
import { createCssTransformer } from "../../src/index.js";

it("rejects removal of a required plugin without changing the instance", () => {
  const css = createCssTransformer({ plugins: [{ name: "base" }, { name: "extra", requires: ["base"] }] });
  expect(() => css.removePlugin("base")).toThrow();
  expect(css.hasPlugin("base")).toBe(true);
  expect(css.removePlugin("extra")).toBe(true);
  expect(css.removePlugin("base")).toBe(true);
});
