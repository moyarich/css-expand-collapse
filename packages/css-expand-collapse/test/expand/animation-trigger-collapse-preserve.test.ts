import { expect, it } from "vitest";
import { collapseLonghands, expandShorthand } from "../../src/index.js";

it("preserves excluded trigger declarations in object collapse", () => {
  const expanded = expandShorthand("animation", "1s example")!;
  const collapsed = collapseLonghands({ ...expanded.declarations, "animation-trigger": "--reveal play" });
  expect(collapsed.animation).toBeDefined();
  expect(collapsed["animation-trigger"]).toBe("--reveal play");
});
