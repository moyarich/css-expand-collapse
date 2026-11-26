import { expect, it } from "vitest";
import { collapseCss, expandCss } from "../../src/index.js";

it("preserves authored animation-trigger independently of browser support (override)", () => {
  const source = ".target{animation:1s ease example;animation-trigger:--reveal play reset}";
  const expanded = expandCss(source);
  expect(expanded).toContain("animation-duration:");
  const trigger = "animation-trigger:--reveal play reset";
  const normalize = (css: string) => css.replace(/,\s*/g, ",");
  for (const css of [expanded, collapseCss(source), collapseCss(expanded)]) {
    expect(normalize(css)).toContain(trigger);
    expect(css.match(/animation-trigger:/g)).toHaveLength(1);
  }
});
