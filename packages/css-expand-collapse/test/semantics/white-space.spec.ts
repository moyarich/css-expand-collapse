import { expect, it } from "vitest";
import { expandCss } from "../../src/index.js";
import { expectRoundTrip } from "./helpers.js";

it("preserves white-space behavior for pre-wrap", ({ skip }) => {
  if (!CSS.supports("white-space-collapse", "preserve") || !CSS.supports("text-wrap-mode", "wrap"))
    skip("Browser does not support white-space constituent properties");
  const css = ".target { white-space: pre-wrap; }";
  expect(expandCss(css)).toContain("white-space-collapse:");
  expectRoundTrip(css, '<div class="target">a  b\n c</div>');
});
