import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";

it("padding three sides", () => {
  expect(expandShorthand("padding", "1rem 2rem 3rem")?.declarations).toEqual({
    "padding-top": "1rem",
    "padding-right": "2rem",
    "padding-bottom": "3rem",
    "padding-left": "2rem",
  });
});
