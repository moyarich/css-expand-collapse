import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";

it("logical margin", () => {
  expect(expandShorthand("margin-inline", "auto 2rem")?.declarations).toEqual({
    "margin-inline-start": "auto",
    "margin-inline-end": "2rem",
  });
});
