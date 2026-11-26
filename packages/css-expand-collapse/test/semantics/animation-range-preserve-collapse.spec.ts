import { expect, it } from "vitest";
import { expandCss, collapseCss } from "../../src/index.js";
import { expectRoundTrip } from "./helpers.js";

it("preserves a nondefault range after animation during collapse", ({ skip }) => {
  if (!CSS.supports("animation-range-start", "entry 20%")) {
    skip("Browser does not support animation range");
    return;
  }
  const source = ".target{animation:1s ease example;animation-range-start:entry 20%}";
  const expanded = expandCss(source);
  expect(expanded).toContain("animation-duration:1s");
  expect(collapseCss(expanded)).toContain("animation-range-start:entry 20%");
  expectRoundTrip(source);
});
