import { expect, it } from "vitest";
import { getLonghands, supportsExpand, supportsCollapse } from "../../src/index.js";

it("recognizes -webkit-line-clamp constituents without enabling transformation", () => {
  expect(getLonghands("-webkit-line-clamp")).toEqual(["max-lines","block-ellipsis","continue"]);
  expect(supportsExpand("-webkit-line-clamp")).toBe(false);
  expect(supportsCollapse("-webkit-line-clamp")).toBe(false);
});
