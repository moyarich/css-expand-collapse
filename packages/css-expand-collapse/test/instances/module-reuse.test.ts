import { expect, it } from "vitest";
import { createCssTransformer, getShorthandModule } from "../../src/index.js";

it("reuses built-in handlers through public module access without sharing writable maps", () => {
  const module = getShorthandModule("margin")!;
  const css = createCssTransformer({ plugins: [{ name: "example", shorthands: { "example-margin": module } }] });
  (module.longhands as Map<string, string>).clear();
  expect(css.getLonghands("example-margin")).toContain("margin-top");
  expect(getShorthandModule("margin")?.longhands.size).toBe(4);
  expect(css.expandShorthand("example-margin", "1px")?.declarations).toEqual({
    "margin-top": "1px", "margin-right": "1px", "margin-bottom": "1px", "margin-left": "1px",
  });
});
