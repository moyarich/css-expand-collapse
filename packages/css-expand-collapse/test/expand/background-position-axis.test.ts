import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";

it("expands physical axes for multiple layers", () => {
  expect(expandShorthand("background-position", "20px 50%, bottom")?.declarations).toEqual({
    "background-position-x": "20px, center",
    "background-position-y": "50%, bottom",
  });
});
