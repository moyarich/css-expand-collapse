import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";

it("font family with spaces", () => {
  expect(expandShorthand("font", 'italic 700 16px/1.5 "Open Sans", sans-serif')?.declarations).toMatchObject({
    "font-style": "italic",
    "font-weight": "700",
    "font-size": "16px",
    "line-height": "1.5",
    "font-family": '"Open Sans", sans-serif',
  });
});
