import { expect, it } from "vitest";
import {
  collapseCss,
  collapseToShorthand,
  expandCss,
  expandShorthand,
  expandShorthands,
  resolveCustomProperties,
} from "../../src/index.js";

it("does not collapse when a variable resolves to an invalid longhand value", () => {
  expect(
    collapseToShorthand(
      "margin",
      {
        "margin-top": "var(--space)",
        "margin-right": "var(--space)",
        "margin-bottom": "var(--space)",
        "margin-left": "var(--space)",
      },
      {
        fillMissingLonghands: false,
        customProperties: { "--space": "8px 16px" },
      },
    ),
  ).toBeNull();
});
