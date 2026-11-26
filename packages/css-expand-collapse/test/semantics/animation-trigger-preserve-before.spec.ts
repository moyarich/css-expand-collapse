import { expect, it } from "vitest";
import { expandCss } from "../../src/index.js";
import { expectEquivalent, expectRoundTrip } from "./helpers.js";

it("matches native animation-trigger behavior (before)", ({ skip }) => {
  if (!CSS.supports("animation-trigger", "--reveal play")) {
    skip("Browser does not support animation triggers");
    return;
  }
  const source = ".target{animation-trigger:--reveal play;animation:1s ease example}";
  expect(expandCss(source)).toContain("animation-duration:1s");
  const reference = ".target{animation:1s ease example;animation-trigger:none}";
  // Compare to the explicit draft-defined reset: current engines may not
  // implement animation-trigger as a reset-only constituent yet.
  expectEquivalent(reference, expandCss(source));
  expectRoundTrip(reference);
});
