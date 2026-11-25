import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";

it("transition layers", () => {
  expect(expandShorthand("transition", "opacity 1s ease 2s, color 3s linear")?.declarations).toEqual({
    "transition-property": "opacity, color",
    "transition-duration": "1s, 3s",
    "transition-timing-function": "ease, linear",
    "transition-delay": "2s, 0s",
    "transition-behavior": "normal, normal",
  });
});
