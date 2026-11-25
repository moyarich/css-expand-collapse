import { expect, it } from "vitest";
import {
  collapseToShorthand,
  expandShorthand,
  supportsTransform,
} from "../../src/index.js";

it("supports logical border-axis shorthands", () => {
  expect(
    expandShorthand("border-block", "2px solid red")?.declarations,
  ).toEqual({
    "border-block-start-width": "2px",
    "border-block-start-style": "solid",
    "border-block-start-color": "red",
    "border-block-end-width": "2px",
    "border-block-end-style": "solid",
    "border-block-end-color": "red",
  });

  expect(
    collapseToShorthand("border-block", {
      "border-block-start-width": "2px",
      "border-block-start-style": "solid",
      "border-block-start-color": "red",
      "border-block-end-width": "2px",
      "border-block-end-style": "solid",
      "border-block-end-color": "red",
    })?.value,
  ).toBe("2px solid red");
});
