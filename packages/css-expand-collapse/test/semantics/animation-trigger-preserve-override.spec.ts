import { expect, it } from "vitest";
import { expandCss } from "../../src/index.js";
import { expectRoundTrip } from "./helpers.js";

it("preserves an animation trigger authored after the animation shorthand", ({ skip }) => {
  if (!CSS.supports("animation-trigger", "--reveal play reset")) {
    skip("Browser does not support animation triggers");
    return;
  }
  const source = ".target{animation:1s ease example;animation-trigger:--reveal play reset}";
  expect(expandCss(source)).toContain("animation-duration:1s");
  expectRoundTrip(source);
});
