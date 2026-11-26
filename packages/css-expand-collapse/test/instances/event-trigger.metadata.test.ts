import { expect, it } from "vitest";
import { getLonghands, supportsExpand, supportsCollapse } from "../../src/index.js";

it("recognizes event-trigger constituents without enabling transformation", () => {
  expect(getLonghands("event-trigger")).toEqual(["event-trigger-name","event-trigger-source"]);
  expect(supportsExpand("event-trigger")).toBe(false);
  expect(supportsCollapse("event-trigger")).toBe(false);
});
