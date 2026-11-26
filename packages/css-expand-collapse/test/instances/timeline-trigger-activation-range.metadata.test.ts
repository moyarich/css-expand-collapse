import { expect, it } from "vitest";
import { getLonghands, supportsExpand, supportsCollapse } from "../../src/index.js";

it("recognizes timeline-trigger-activation-range constituents without enabling transformation", () => {
  expect(getLonghands("timeline-trigger-activation-range")).toEqual(["timeline-trigger-activation-range-start","timeline-trigger-activation-range-end"]);
  expect(supportsExpand("timeline-trigger-activation-range")).toBe(false);
  expect(supportsCollapse("timeline-trigger-activation-range")).toBe(false);
});
