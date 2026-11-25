import { expect, it } from "vitest";
import {
  collapseCss,
  collapseToShorthand,
  expandCss,
  expandShorthand,
  expandShorthands,
  resolveCustomProperties,
} from "../../src/index.js";

it("resolves nested var() references and fallbacks", () => {
  expect(
    resolveCustomProperties("calc(var(--space) * 2)", {
      "--space": "var(--base)",
      "--base": "8px",
    }),
  ).toBe("calc(8px * 2)");

  expect(
    resolveCustomProperties("var(--missing, var(--fallback))", {
      "--fallback": "red",
    }),
  ).toBe("red");
});
