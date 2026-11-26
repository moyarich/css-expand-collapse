import { expect, it } from "vitest";
import { getLonghands, supportsExpand, supportsCollapse } from "../../src/index.js";

it("recognizes timeline-trigger constituents without enabling transformation", () => {
  expect(getLonghands("timeline-trigger")).toEqual(["timeline-trigger-name","timeline-trigger-source","timeline-trigger-activation-range-start","timeline-trigger-activation-range-end","timeline-trigger-active-range-start","timeline-trigger-active-range-end"]);
  expect(supportsExpand("timeline-trigger")).toBe(false);
  expect(supportsCollapse("timeline-trigger")).toBe(false);
});
