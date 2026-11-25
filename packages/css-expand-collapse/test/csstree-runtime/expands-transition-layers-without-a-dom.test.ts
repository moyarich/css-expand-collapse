import { expect, it } from "vitest";
import {
  collapseToShorthand,
  expandShorthand,
  supportsTransform,
} from "../../src/index.js";

it("expands transition layers without a DOM", () => {
  expect(
    expandShorthand("transition", "opacity 200ms ease 50ms")?.declarations,
  ).toEqual({
    "transition-property": "opacity",
    "transition-duration": "200ms",
    "transition-timing-function": "ease",
    "transition-delay": "50ms",
    "transition-behavior": "normal",
  });
});
