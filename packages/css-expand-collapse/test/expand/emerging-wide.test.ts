import { expect, it } from "vitest";
import { expandCss, collapseCss } from "../../src/index.js";

it("preserves recognized-only line-clamp declarations", () => {
  const source = ".target{line-clamp:inherit!important}";
  expect(expandCss(source)).toBe(source);
  expect(collapseCss(source)).toBe(source);
});
