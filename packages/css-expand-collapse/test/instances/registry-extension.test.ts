import { expect, it } from "vitest";
import { createCssTransformer } from "../../src/index.js";
it("adds a missing handler without replacing unrelated fields", () => {
  const css = createCssTransformer();
  css.registerShorthand("example-size", { longhands: new Map([["margin-top", "0"]]), experimental: true });
  css.extendShorthand("example-size", { expand: (value) => ({ "margin-top": value }) });
  expect(css.supportsExpand("example-size")).toBe(true);
  expect(css.getShorthandMetadata("example-size")?.experimental).toBe(true);
});
