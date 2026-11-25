import { expect, it } from "vitest";
import { expandCss } from "../../src/index.js";

it("uses :root variables to expand background while preserving the reference", () => {
  const css = expandCss(`
    :root {
      --bg-color: rgb(10 20 30);
    }

    .card {
      background: var(--bg-color);
    }
  `);

  expect(css).toMatch(/--bg-color:\s*rgb\(10 20 30\)/);
  expect(css).toContain("background-color:var(--bg-color)");
  expect(css).toContain("background-image:none");
  expect(css).not.toContain("background:var(--bg-color)");
});
