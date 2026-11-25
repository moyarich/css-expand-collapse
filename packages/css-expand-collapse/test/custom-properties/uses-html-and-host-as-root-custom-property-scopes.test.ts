import { expect, it } from "vitest";
import {
  collapseCss,
  collapseToShorthand,
  expandCss,
  expandShorthand,
  expandShorthands,
  resolveCustomProperties,
} from "../../src/index.js";

it("uses html and :host as root custom-property scopes", () => {
  const documentCss = expandCss(`
    html { --color: red; }
    .card { border-color: var(--color); }
  `);
  expect(documentCss).toContain("border-top-color:var(--color)");

  const shadowCss = expandCss(`
    :host { --color: blue; }
    .card { border-color: var(--color); }
  `);
  expect(shadowCss).toContain("border-top-color:var(--color)");
});
