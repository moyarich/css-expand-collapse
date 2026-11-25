import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";

it("nested calc", () => {
  expect(expandShorthand("gap", "calc(1rem + 2px) 5%")?.declarations).toEqual({
    "row-gap": "calc(1rem + 2px)",
    "column-gap": "5%",
  });
});
