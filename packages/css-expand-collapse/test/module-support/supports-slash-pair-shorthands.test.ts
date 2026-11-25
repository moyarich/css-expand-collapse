import { expect, it } from "vitest";
import {
  collapseToShorthand,
  expandShorthand,
  supportsTransform,
} from "../../src/index.js";

it("supports slash-pair shorthands", () => {
  expect(
    expandShorthand("container", "sidebar / inline-size")?.declarations,
  ).toEqual({
    "container-name": "sidebar",
    "container-type": "inline-size",
  });

  expect(expandShorthand("grid-column", "2 / span 3")?.declarations).toEqual({
    "grid-column-start": "2",
    "grid-column-end": "span 3",
  });

  expect(
    collapseToShorthand("grid-column", {
      "grid-column-start": "2",
      "grid-column-end": "span 3",
    })?.value,
  ).toBe("2 / span 3");
});
