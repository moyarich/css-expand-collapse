import { expect, it } from "vitest";
import {
  collapseCss,
  collapseToShorthand,
  expandCss,
  expandShorthand,
  expandShorthands,
  resolveCustomProperties,
} from "../../src/index.js";

it("preserves a shorthand when a known variable expands to multiple components", () => {
  const css = expandCss(`
    :root { --space: 8px 16px; }
    .card { margin: var(--space); }
  `);

  expect(css).toContain("margin:var(--space)");
  expect(css).not.toContain("margin-top");
});
