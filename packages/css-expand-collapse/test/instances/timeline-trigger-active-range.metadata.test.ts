import { expect, it } from "vitest";
import { getLonghands, supportsExpand, supportsCollapse } from "../../src/index.js";

it("recognizes timeline-trigger-active-range constituents without enabling transformation", () => {
  expect(getLonghands("timeline-trigger-active-range")).toEqual(["timeline-trigger-active-range-start","timeline-trigger-active-range-end"]);
  expect(supportsExpand("timeline-trigger-active-range")).toBe(false);
  expect(supportsCollapse("timeline-trigger-active-range")).toBe(false);
});
