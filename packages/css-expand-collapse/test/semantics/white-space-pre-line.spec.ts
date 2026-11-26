import { expect, it } from "vitest";
import { expandCss } from "../../src/index.js";
import { expectRoundTrip } from "./helpers.js";

it("preserves pre-line white-space behavior", ({ skip }) => {
  if (!CSS.supports("white-space-collapse", "preserve-breaks") || !CSS.supports("text-wrap-mode", "wrap"))
    skip("Browser does not support white-space constituent properties");
  const css = ".target { white-space: pre-line; }";
  expect(expandCss(css)).toContain("white-space-collapse:preserve-breaks");
  expectRoundTrip(css, '<div class="target">a  b\n c</div>');
});
