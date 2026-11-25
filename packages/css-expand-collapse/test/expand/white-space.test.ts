import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";

it("expands pre-wrap and resets the trim constituent", () => {
  expect(expandShorthand("white-space", "pre-wrap")?.declarations).toEqual({
    "white-space-collapse": "preserve",
    "text-wrap-mode": "wrap",
    "white-space-trim": "none",
  });
});
