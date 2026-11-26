import { expect, it } from "vitest";
import { expandCss } from "../../src/index.js";
import { expectRoundTrip } from "./helpers.js";

it("matches native animation-trigger behavior (priority)", ({ skip }) => {
  if (!CSS.supports("animation-trigger", "--reveal play")) {
    skip("Browser does not support animation triggers");
    return;
  }
  const source = ".target{animation-trigger:--reveal play!important;animation:1s example!important}";
  expect(expandCss(source)).toContain("animation-duration:1s!important");
  expectRoundTrip(source);
});
