import { expect, it } from "vitest";
import { createCssTransformer } from "../../src/index.js";
it("rejects cyclic registry changes atomically", () => {
  const css = createCssTransformer();
  css.registerShorthand("example-a", { longhands: new Map([["example-b", "none"]]) });
  expect(() => css.registerShorthand("example-b", { longhands: new Map([["example-a", "none"]]) })).toThrow();
  expect(css.isShorthand("example-b")).toBe(false);
});
