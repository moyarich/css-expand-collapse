import { expect, it } from "vitest";
import { expandCss, collapseCss } from "../../src/index.js";

it("preserves recognized-only text-spacing declarations", () => {
  const source = ".target{text-spacing:var(--spacing)}";
  expect(expandCss(source)).toBe(source);
  expect(collapseCss(source)).toBe(source);
});
