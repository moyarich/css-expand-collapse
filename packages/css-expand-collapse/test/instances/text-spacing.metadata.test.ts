import { expect, it } from "vitest";
import { getLonghands, supportsExpand, supportsCollapse } from "../../src/index.js";

it("recognizes text-spacing constituents without enabling transformation", () => {
  expect(getLonghands("text-spacing")).toEqual(["text-spacing-trim","text-autospace"]);
  expect(supportsExpand("text-spacing")).toBe(false);
  expect(supportsCollapse("text-spacing")).toBe(false);
});
