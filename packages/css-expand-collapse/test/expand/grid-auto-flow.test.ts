import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";

it("grid auto flow", () => {
  expect(expandShorthand("grid", "auto-flow dense 20px / 1fr 2fr")?.declarations).toEqual({
    "grid-auto-columns": "auto",
    "grid-auto-flow": "row dense",
    "grid-auto-rows": "20px",
    "grid-template-areas": "none",
    "grid-template-columns": "1fr 2fr",
    "grid-template-rows": "none",
  });
});
