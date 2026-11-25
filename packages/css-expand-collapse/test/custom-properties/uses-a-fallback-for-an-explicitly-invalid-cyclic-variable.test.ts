import { expect, it } from "vitest";
import {
  collapseCss,
  collapseToShorthand,
  expandCss,
  expandShorthand,
  expandShorthands,
  resolveCustomProperties,
} from "../../src/index.js";

it("uses a fallback for an explicitly invalid cyclic variable", () => {
  expect(
    resolveCustomProperties("var(--color, rebeccapurple)", {
      "--color": "var(--color)",
    }),
  ).toBe("rebeccapurple");
});
