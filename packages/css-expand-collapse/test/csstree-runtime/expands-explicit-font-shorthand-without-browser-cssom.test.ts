import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";

it("expands explicit font shorthand without browser CSSOM", () => {
  expect(
    expandShorthand("font", 'italic 700 16px/1.5 "Open Sans", sans-serif')
      ?.declarations,
  ).toEqual({
    "font-family": '"Open Sans", sans-serif',
    "font-size": "16px",
    "font-width": "normal",
    "font-style": "italic",
    "font-variant": "normal",
    "font-weight": "700",
    "line-height": "1.5",
  });
});
