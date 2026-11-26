import { expect, it } from "vitest";
import { expandCss } from "../../src/index.js";
import { expectEquivalent, expectRoundTrip } from "./helpers.js";

it("preserves a previously authored animation trigger", ({ skip }) => {
  if (!CSS.supports("animation-trigger", "--reveal play")) {
    skip("Browser does not support animation triggers");
    return;
  }
  const source = ".target{animation-trigger:--reveal play;animation:1s ease example}";
  const reference = ".target{animation:1s ease example;animation-trigger:--reveal play}";
  expectEquivalent(source, reference);
  expect(expandCss(source)).toContain("animation-duration:1s");
  expectRoundTrip(source);
});
