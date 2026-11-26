import { expect, it } from "vitest";
import { createCssTransformer } from "../../src/index.js";

it("requires explicit override and restores the built-in on unregister", () => {
  const css = createCssTransformer();
  const module = { longhands: new Map([["margin-top", "0"]]) };
  expect(() => css.registerShorthand("margin", module)).toThrow();
  css.registerShorthand("margin", module, { override: true });
  expect(css.supportsExpand("margin")).toBe(false);
  css.unregisterShorthand("margin");
  expect(css.supportsExpand("margin")).toBe(true);
});
