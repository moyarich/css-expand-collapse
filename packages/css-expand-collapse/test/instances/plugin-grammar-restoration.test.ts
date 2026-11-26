import { expect, it } from "vitest";
import { createCssTransformer } from "../../src/index.js";

it("restores the previous grammar after removing an overriding plugin", () => {
  const css = createCssTransformer();
  css.addPlugin({ name: "first", grammars: { "margin-top": (value) => value === "2px" } });
  css.addPlugin({ name: "second", grammars: { "margin-top": () => false } }, { override: true });
  const values = { "margin-top": "2px", "margin-right": "2px", "margin-bottom": "2px", "margin-left": "2px" };
  expect(css.collapseToShorthand("margin", values)).toBeNull();
  css.removePlugin("second");
  expect(css.collapseToShorthand("margin", values)?.value).toBe("2px");
});
