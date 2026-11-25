import { expect, it } from "vitest";
import { expandCss } from "../../src/index.js";

it("does not assume an unknown fallback is the final cascaded value", () => {
  const css = expandCss(`
    .card { border-color: var(--external-color, red); }
  `);

  expect(css).toMatch(/border-color:var\(--external-color,\s*red\)/);
  expect(css).not.toContain("border-top-color");
});
