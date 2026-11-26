import { expect, it } from "vitest";
import { collapseDeclarations, expandDeclarations } from "../../src/index.js";

it("preserves an important animation-trigger during declaration round trips", () => {
  const source = "animation-trigger:--reveal play!important;animation:fade 1s";
  const expanded = expandDeclarations(source);
  expect(expanded).toContain("animation-duration:1s");
  expect(expanded).toContain("animation-trigger:--reveal play!important");
  const collapsed = collapseDeclarations(expanded);
  expect(collapsed).toMatch(/animation:[^;}]+/);
  expect([...collapsed.matchAll(/animation-trigger:([^;}]+)/g)].map(match => match[1])).toEqual(["--reveal play!important"]);
});
