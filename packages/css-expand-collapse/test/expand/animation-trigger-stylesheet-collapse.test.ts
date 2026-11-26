import { expect, it } from "vitest";
import { collapseCss, expandCss } from "../../src/index.js";

it("preserves the authored animation-trigger during stylesheet collapse", () => {
  const source = ".target{animation-trigger:--reveal play;animation:fade 1s}";
  const collapsed = collapseCss(expandCss(source));
  expect(collapsed).toMatch(/animation:[^;}]+/);
  expect([...collapsed.matchAll(/animation-trigger:([^;}]+)/g)].map(match => match[1])).toEqual(["--reveal play"]);
});
