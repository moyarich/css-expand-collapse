import { expect, it } from "vitest";
import { expandCss } from "../../src/index.js";
import { expectEquivalent, expectRoundTrip } from "./helpers.js";

it("matches native animation-trigger behavior (priority)", ({ skip }) => {
  if (!CSS.supports("animation-trigger", "--reveal play")) {
    skip("Browser does not support animation triggers");
    return;
  }
  const source = ".target{animation-trigger:--reveal play!important;animation:1s example!important}";
  expect(expandCss(source)).toContain("animation-duration:1s!important");
  const reference = ".target{animation:1s example!important;animation-trigger:none!important}";
  // Compare to the explicit draft-defined reset: current engines may not
  // implement animation-trigger as a reset-only constituent yet.
  expectEquivalent(reference, expandCss(source));
  expectRoundTrip(reference);
});
