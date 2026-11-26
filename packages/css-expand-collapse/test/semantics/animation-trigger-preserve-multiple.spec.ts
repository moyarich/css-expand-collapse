import { expect, it } from "vitest";
import { expandCss } from "../../src/index.js";
import { expectEquivalent, expectRoundTrip } from "./helpers.js";

it("matches native animation-trigger behavior (multiple)", ({ skip }) => {
  if (!CSS.supports("animation-trigger", "--first play,--second play pause")) {
    skip("Browser does not support multiple animation triggers");
    return;
  }
  const source = ".target{animation-trigger:--first play,--second play pause;animation:1s first,2s second}";
  expect(expandCss(source)).toContain("animation-duration:");
  const reference = ".target{animation:1s first,2s second;animation-trigger:none}";
  // Compare to the explicit draft-defined reset: current engines may not
  // implement animation-trigger as a reset-only constituent yet.
  expectEquivalent(reference, expandCss(source));
  expectRoundTrip(reference);
});
