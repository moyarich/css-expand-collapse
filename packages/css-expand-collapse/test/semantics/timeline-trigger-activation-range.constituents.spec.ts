import { it } from "vitest";
import { expectEquivalent } from "./helpers.js";

it("compares timeline-trigger-activation-range with its start and end constituents", ({ skip }) => {
  const parts = [["timeline-trigger-activation-range-start","normal"],["timeline-trigger-activation-range-end","normal"]] as const;
  if (!CSS.supports("timeline-trigger-activation-range", "normal") || !parts.every(([property, value]) => CSS.supports(property, value))) {
    skip("Browser does not expose all tested constituents");
    return;
  }
  expectEquivalent(".target{timeline-trigger-activation-range:normal}", ".target{" + parts.map(([property, value]) => property + ":" + value).join(";") + "}");
});
