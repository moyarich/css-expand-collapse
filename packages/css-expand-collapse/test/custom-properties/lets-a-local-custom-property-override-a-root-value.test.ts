import { expect, it } from "vitest";
import {
  collapseCss,
  collapseToShorthand,
  expandCss,
  expandShorthand,
  expandShorthands,
  resolveCustomProperties,
} from "../../src/index.js";

it("lets a local custom property override a root value", () => {
  const css = expandCss(`
    :root { --color: red; }
    .card {
      --color: blue;
      border-color: var(--color);
    }
  `);

  expect(css).toMatch(/--color:\s*blue/);
  expect(css).toContain("border-top-color:var(--color)");
});
