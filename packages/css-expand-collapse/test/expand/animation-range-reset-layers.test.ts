import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";

it("resets both range constituents to single initial values for multiple animation layers", () => {
  expect(expandShorthand("animation", "fade 1s, slide 2s")?.declarations).toMatchObject({
    "animation-range-start": "normal",
    "animation-range-end": "normal",
    "animation-timeline": "auto",
    "animation-trigger": "none",
  });
});
