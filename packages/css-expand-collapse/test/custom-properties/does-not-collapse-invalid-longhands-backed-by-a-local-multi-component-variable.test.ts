import { expect, it } from "vitest";
import {
  collapseCss,
  collapseToShorthand,
  expandCss,
  expandShorthand,
  expandShorthands,
  resolveCustomProperties,
} from "../../src/index.js";

it("does not collapse invalid longhands backed by a local multi-component variable", () => {
  const css = collapseCss(`
    .card {
      --space: 8px 16px;
      margin-top: var(--space);
      margin-right: var(--space);
      margin-bottom: var(--space);
      margin-left: var(--space);
    }
  `);

  expect(css).toContain("margin-top:var(--space)");
  expect(css).toContain("margin-right:var(--space)");
  expect(css).toContain("margin-bottom:var(--space)");
  expect(css).toContain("margin-left:var(--space)");
  expect(css).not.toContain("margin:var(--space)");
});
