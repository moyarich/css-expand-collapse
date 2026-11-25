import { expect, it } from "vitest";
import { expandCss } from "../../src/index.js";

it("expands declarations inside a stylesheet", () => {
  const css = expandCss(`
    @media (min-width: 40rem) {
      .example { margin: 10px 20px; }
    }
  `);
  expect(css).toContain("margin-top:10px");
  expect(css).toContain("margin-right:20px");
  expect(css).toContain("margin-bottom:10px");
  expect(css).toContain("margin-left:20px");
});
