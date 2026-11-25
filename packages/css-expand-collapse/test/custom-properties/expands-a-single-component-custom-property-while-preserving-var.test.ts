import { expect, it } from "vitest";
import {
  collapseCss,
  collapseToShorthand,
  expandCss,
  expandShorthand,
  expandShorthands,
  resolveCustomProperties,
} from "../../src/index.js";

it("expands a single-component custom property while preserving var()", () => {
  expect(
    expandShorthand("border-color", "var(--color)", {
      customProperties: { "--color": "red" },
    })?.declarations,
  ).toEqual({
    "border-top-color": "var(--color)",
    "border-right-color": "var(--color)",
    "border-bottom-color": "var(--color)",
    "border-left-color": "var(--color)",
  });
});
