import { it } from "vitest";
import { expectEquivalent } from "./helpers.js";

it("compares timeline-trigger-active-range with its start and end constituents", ({ skip }) => {
  const parts = [["timeline-trigger-active-range-start","auto"],["timeline-trigger-active-range-end","auto"]] as const;
  if (!CSS.supports("timeline-trigger-active-range", "auto") || !parts.every(([property, value]) => CSS.supports(property, value))) {
    skip("Browser does not expose all tested constituents");
    return;
  }
  expectEquivalent(".target{timeline-trigger-active-range:auto}", ".target{" + parts.map(([property, value]) => property + ":" + value).join(";") + "}");
});
