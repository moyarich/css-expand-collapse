import { expect, it } from "vitest";
import { collapseToShorthand, expandShorthand } from "../../src/index.js";

it("expands and collapses flex without a DOM", () => {
  expect(expandShorthand("flex", "2 0 10rem")?.declarations).toEqual({
    "flex-grow": "2",
    "flex-shrink": "0",
    "flex-basis": "10rem",
  });

  expect(expandShorthand("flex", "3")?.declarations).toEqual({
    "flex-grow": "3",
    "flex-shrink": "1",
    "flex-basis": "0%",
  });

  expect(
    collapseToShorthand("flex", {
      "flex-grow": "0",
      "flex-shrink": "0",
      "flex-basis": "auto",
    })?.value,
  ).toBe("none");
});
