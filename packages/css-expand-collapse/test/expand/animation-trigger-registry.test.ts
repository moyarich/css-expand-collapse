import { expect, it } from "vitest";
import { getShorthands, isLonghand, isShorthand } from "../../src/index.js";

it("registers animation-trigger only as an animation longhand", () => {
  expect(isShorthand("animation-trigger")).toBe(false);
  expect(isLonghand("animation-trigger")).toBe(true);
  expect(getShorthands("animation-trigger")).toEqual(["animation"]);
});
