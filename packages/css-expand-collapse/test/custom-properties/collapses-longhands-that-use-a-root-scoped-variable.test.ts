import { expect, it } from "vitest";
import { collapseCss } from "../../src/index.js";

it("collapses longhands that use a root-scoped variable", () => {
  const css = collapseCss(`
    :root { --color: red; }
    .card {
      border-top-color: var(--color);
      border-right-color: var(--color);
      border-bottom-color: var(--color);
      border-left-color: var(--color);
    }
  `);

  expect(css).toContain("border-color:var(--color)");
  expect(css).not.toContain("border-top-color");
});
