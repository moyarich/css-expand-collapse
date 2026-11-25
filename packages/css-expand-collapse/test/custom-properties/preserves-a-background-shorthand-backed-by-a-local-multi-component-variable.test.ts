import { expect, it } from "vitest";
import { expandCss } from "../../src/index.js";

it("preserves a background shorthand backed by a local multi-component variable", () => {
  const css = expandCss(`
    .hero {
      --surface: url(hero.png) center / cover no-repeat #111;
      background: var(--surface);
    }
  `);

  expect(css).toContain("background:var(--surface)");
  expect(css).not.toContain("background-image:var(--surface)");
  expect(css).not.toContain("background-color:var(--surface)");
});
