import { expect, it } from "vitest";
import { collapseToShorthand, expandShorthand } from "../../src/index.js";

it("refuses to collapse a nondefault animation trigger", () => {
  const expanded = expandShorthand("animation", "1s example")!;
  expect(collapseToShorthand("animation", { ...expanded.declarations, "animation-trigger": "--reveal play" })).toBeNull();
});
