import { expect, it } from "vitest";
import { createCssTransformer } from "../../src/index.js";

it("copies caller-owned constituent maps and exclusion metadata", () => {
  const css = createCssTransformer();
  const longhands = new Map([["margin-top", "0px"], ["margin-bottom", "0px"]]);
  const excludedLonghands = ["margin-bottom"];
  css.registerShorthand("example-size", { longhands, excludedLonghands, expand: (value) => ({ "margin-top": value }) });
  longhands.clear();
  excludedLonghands.push("margin-top");
  expect(css.supportsExpand("example-size")).toBe(true);
  expect(css.getLonghands("example-size")).toEqual(["margin-top", "margin-bottom"]);
});
