import { expect, it } from "vitest";
import { collapseToShorthand, expandShorthand } from "../../src/index.js";

it("does not consume an excluded animation trigger", () => {
  const expanded = expandShorthand("animation", "1s example")!;
  const collapsed = collapseToShorthand("animation", { ...expanded.declarations, "animation-trigger": "--reveal play" });
  expect(collapsed).not.toBeNull();
  expect(collapsed?.consumed).not.toContain("animation-trigger");
  expect(collapsed?.declarations).not.toHaveProperty("animation-trigger");
});
