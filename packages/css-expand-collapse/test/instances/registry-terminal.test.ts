import { expect, it } from "vitest";
import { createCssTransformer } from "../../src/index.js";
it("discovers terminal constituents without changing direct relationships", () => {
  const css = createCssTransformer();
  css.registerShorthand("example-size", { category: "custom", longhands: new Map([["margin", "0"]]) });
  const metadata = css.getShorthandMetadata("example-size");
  expect(metadata?.longhands).toEqual(["margin"]);
  expect(metadata?.terminalLonghands).toContain("margin-top");
  expect(metadata?.category).toBe("custom");
});
