import { expect, it } from "vitest";
import { expandCss } from "../../src/index.js";

it("uses a local multi-component variable instead of a root single-component value", () => {
  const css = expandCss(`
    :root { --space: 8px; }

    .card {
      --space: 8px 16px;
      margin: var(--space);
    }
  `);

  expect(css).toMatch(/--space:\s*8px 16px/);
  expect(css).toContain("margin:var(--space)");
  expect(css).not.toContain("margin-top:var(--space)");
});
