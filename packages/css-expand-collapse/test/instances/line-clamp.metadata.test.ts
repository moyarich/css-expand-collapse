import { expect, it } from "vitest";
import { getLonghands, supportsExpand, supportsCollapse } from "../../src/index.js";

it("recognizes line-clamp constituents without enabling transformation", () => {
  expect(getLonghands("line-clamp")).toEqual(["max-lines","block-ellipsis","continue"]);
  expect(supportsExpand("line-clamp")).toBe(false);
  expect(supportsCollapse("line-clamp")).toBe(false);
});
