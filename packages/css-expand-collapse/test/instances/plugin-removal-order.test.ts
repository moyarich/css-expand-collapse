import { expect, it } from "vitest";
import { createCssTransformer } from "../../src/index.js";

it("preserves later overrides when removing an earlier plugin", () => {
  const css = createCssTransformer();
  const first = { longhands: new Map([["margin-top", "0"]]), expand: () => ({ "margin-top": "1px" }) };
  const second = { longhands: new Map([["margin-top", "0"]]), expand: () => ({ "margin-top": "2px" }) };
  css.addPlugin({ name: "first", shorthands: { "example-size": first } });
  css.addPlugin({ name: "second", shorthands: { "example-size": second } }, { override: true });
  css.removePlugin("first");
  expect(css.expand({ "example-size": "any" })).toEqual({ "margin-top": "2px" });
  css.removePlugin("second");
  expect(css.isShorthand("example-size")).toBe(false);
});
