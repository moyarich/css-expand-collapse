import { expect, it } from "vitest";
import {
  collapseCss,
  collapseToShorthand,
  expandCss,
  expandShorthand,
  expandShorthands,
  resolveCustomProperties,
} from "../../src/index.js";

it("uses background-color var() when deciding whether background can collapse", () => {
  const css = collapseCss(`
    :root { --bg-color: rgb(10 20 30); }
    .card {
      background-image: none;
      background-position: 0% 0%;
      background-size: auto auto;
      background-repeat: repeat;
      background-origin: padding-box;
      background-clip: border-box;
      background-attachment: scroll;
      background-color: var(--bg-color);
    }
  `);

  expect(css).toContain("background:");
  expect(css).toContain("var(--bg-color)");
  expect(css).not.toContain("background-color:");
});
