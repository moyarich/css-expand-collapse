import { expect, it } from "vitest";
import { expandCss } from "../../src/index.js";

it("expands a shorthand when a scoped custom property proves each longhand is valid", () => {
  const css = expandCss(`
    .example {
      border-color: red;
    }

    a {
      --color: red;
      border-color: var(--color);
    }
  `);

  expect(css).toContain("border-top-color:red");
  expect(css).toContain("border-right-color:red");
  expect(css).toContain("border-bottom-color:red");
  expect(css).toContain("border-left-color:red");

  expect(css).toMatch(/--color:\s*red/);
  expect(css).toContain("border-top-color:var(--color)");
  expect(css).toContain("border-right-color:var(--color)");
  expect(css).toContain("border-bottom-color:var(--color)");
  expect(css).toContain("border-left-color:var(--color)");
  expect(css).not.toContain("border-color:var(--color)");
});
