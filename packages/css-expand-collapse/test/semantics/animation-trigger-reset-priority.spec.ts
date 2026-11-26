import { expect, it } from "vitest";
import { expandCss } from "../../src/index.js";
import { expectEquivalent, expectRoundTrip } from "./helpers.js";

it("resets an important trigger with an equally important animation shorthand", ({ skip }) => {
  if (!CSS.supports("animation-trigger", "--reveal play")) {
    skip("Browser does not support animation triggers");
    return;
  }
  const source = ".target{animation-trigger:--reveal play!important;animation:1s example!important}";
  const reference = ".target{animation:1s example!important;animation-trigger:none!important}";
  expectEquivalent(source, reference);
  expect(expandCss(source)).toContain("animation-duration:1s!important");
  expectRoundTrip(source);
});
