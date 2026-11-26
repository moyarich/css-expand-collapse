import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";

it("excludes animation-trigger from CSS-wide expansion", () => {
  const result = expandShorthand("animation", "initial");
  expect(result?.declarations["animation-name"]).toBe("initial");
  expect(result?.declarations).not.toHaveProperty("animation-trigger");
});
