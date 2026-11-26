import { it } from "vitest";
import { validateProperty } from "../../src/index.js";
import { expectEquivalent } from "./helpers.js";

it("compares a timeline trigger reset with its specified constituents when supported", ({ skip }) => {
  const parts = [
    ["timeline-trigger-name", "none"],
    ["timeline-trigger-source", "auto"],
    ["timeline-trigger-activation-range", "normal"],
    ["timeline-trigger-active-range", "normal"],
  ] as const;
  const grammar = [validateProperty("timeline-trigger", "none").valid, ...parts.map(([name, value]) => validateProperty(name, value).valid)];
  const supported = CSS.supports("timeline-trigger", "none") && parts.every(([name, value]) => CSS.supports(name, value));
  console.info("shorthand constituent audit", JSON.stringify({ property: "timeline-trigger", grammar, supported }));
  if (!supported) {
    skip("Browser does not expose all specified constituents");
    return;
  }
  expectEquivalent(".target{timeline-trigger:none}", ".target{" + parts.map(([name, value]) => name + ":" + value).join(";") + "}");
});
