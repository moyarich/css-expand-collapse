import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";

it("resets both range constituents for every animation layer", () => {
  expect(expandShorthand("animation", "fade 1s, slide 2s")?.declarations).toMatchObject({
    "animation-range-start": "normal, normal",
    "animation-range-end": "normal, normal",
  });
});
