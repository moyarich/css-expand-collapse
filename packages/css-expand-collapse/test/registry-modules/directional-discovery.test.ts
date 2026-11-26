import { expect, it } from "vitest";
import { listShorthands, supportsExpand, supportsCollapse } from "../../src/index.js";

it("discovers active directions independently", () => {
  expect(supportsExpand("margin")).toBe(true);
  expect(supportsCollapse("margin")).toBe(true);
  expect(supportsExpand("background-repeat")).toBe(false);
  expect(supportsCollapse("background-repeat")).toBe(false);
  expect(listShorthands({ expand: false, collapse: false }).map(item => item.property)).toContain("all");
});
