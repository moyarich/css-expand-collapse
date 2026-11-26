import { expect, it } from "vitest";
import { getLonghands, getShorthands, isLonghand, isShorthand } from "../../src/index.js";

it("registers animation-trigger only as an animation longhand", () => {
  expect(isShorthand("animation-trigger")).toBe(false);
  expect(isLonghand("animation-trigger")).toBe(true);
  expect(getLonghands("animation")).toContain("animation-trigger");
  expect(getShorthands("animation-trigger")).toEqual(["animation"]);
});
