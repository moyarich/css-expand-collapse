import { expect, it } from "vitest";
import {
  collapseCss,
  collapseToShorthand,
  expandCss,
  expandShorthand,
  expandShorthands,
  resolveCustomProperties,
} from "../../src/index.js";

it("does not expand a multi-component variable into incompatible longhands", () => {
  expect(
    expandShorthand("margin", "var(--space)", {
      customProperties: { "--space": "8px 16px" },
    }),
  ).toBeNull();
});
