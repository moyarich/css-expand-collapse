import { expect, it } from "vitest";
import {
  collapseCss,
  collapseToShorthand,
  expandCss,
  expandShorthand,
  expandShorthands,
  resolveCustomProperties,
} from "../../src/index.js";

it("preserves a shorthand when a locally scoped variable expands to multiple components", () => {
  const css = expandCss(`
    .card {
      --space: 8px 16px;
      margin: var(--space);
    }
  `);

  expect(css).toMatch(/--space:\s*8px 16px/);
  expect(css).toContain("margin:var(--space)");
  expect(css).not.toContain("margin-top");
  expect(css).not.toContain("margin-right");
  expect(css).not.toContain("margin-bottom");
  expect(css).not.toContain("margin-left");
});
