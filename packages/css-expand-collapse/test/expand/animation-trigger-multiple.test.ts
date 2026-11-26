import { expect, it } from "vitest";
import { collapseCss, expandCss } from "../../src/index.js";

it("preserves authored animation-trigger independently of browser support (multiple)", () => {
  const source = ".target{animation-trigger:--first play,--second play pause;animation:1s first,2s second}";
  const expanded = expandCss(source);
  expect(expanded).toContain("animation-duration:");
  const trigger = "animation-trigger:--first play,--second play pause";
  const normalize = (css: string) => css.replace(/,\s*/g, ",");
  for (const css of [expanded, collapseCss(source), collapseCss(expanded)]) {
    expect(normalize(css)).toContain(trigger);
    expect(css.match(/animation-trigger:/g)).toHaveLength(1);
  }
});
