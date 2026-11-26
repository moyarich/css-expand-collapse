import { expect, it } from "vitest";
import { getLonghands, supportsExpand, supportsCollapse } from "../../src/index.js";

it("recognizes background-repeat constituents without enabling transformation", () => {
  expect(getLonghands("background-repeat")).toEqual(["background-repeat-x","background-repeat-y"]);
  expect(supportsExpand("background-repeat")).toBe(false);
  expect(supportsCollapse("background-repeat")).toBe(false);
});
