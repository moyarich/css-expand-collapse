import { expect, it } from "vitest";
import { expandCss } from "../../src/index.js";
import { expectRoundTrip } from "./helpers.js";

it("preserves animation shorthand reset interactions with animation-range-start", ({ skip }) => {
  if (!CSS.supports("animation-range-start", "entry 20%")) {
    skip("Browser does not support the tested property value");
    return;
  }
  const source = ".target{animation-range-start:entry 20%;animation:1s ease example}";
  const expanded = expandCss(source);
  expect(expanded).toContain("animation-duration:1s");
  expectRoundTrip(source);
});
