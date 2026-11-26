import { expect, it } from "vitest";
import { expandCss, collapseCss } from "../../src/index.js";

it("preserves recognized-only background-repeat declarations", () => {
  const source = ".target{background-repeat:repeat-x,no-repeat}";
  expect(expandCss(source)).toBe(source);
  expect(collapseCss(source)).toBe(source);
});
