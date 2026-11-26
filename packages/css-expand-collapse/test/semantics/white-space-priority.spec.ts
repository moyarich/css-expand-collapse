import { expect, it } from "vitest";
import { expandCss } from "../../src/index.js";
import { expectRoundTrip } from "./helpers.js";

it("preserves white-space priority and later constituent overrides", ({ skip }) => {
  if (!CSS.supports("white-space-collapse", "preserve") || !CSS.supports("text-wrap-mode", "wrap")) {
    skip("Browser does not support white-space constituents");
    return;
  }
  const source = ".target{white-space:pre!important;text-wrap-mode:wrap!important;white-space:normal}";
  expect(expandCss(source)).toContain("white-space-collapse:preserve!important");
  expectRoundTrip(source, '<div class="target">a  b\n c</div>');
});
