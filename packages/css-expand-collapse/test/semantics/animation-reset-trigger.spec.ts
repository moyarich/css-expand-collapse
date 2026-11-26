import { expect, it } from "vitest";
import { expandCss } from "../../src/index.js";
import { expectRoundTrip } from "./helpers.js";

it("preserves animation shorthand reset interactions with animation-trigger", ({ skip }) => {
  if (!CSS.supports("animation-trigger", "--reveal")) {
    skip("Browser does not support the tested property value");
    return;
  }
  const source = ".target{animation-trigger:--reveal;animation:1s ease example}";
  const expanded = expandCss(source);
  expect(expanded).toContain("animation-duration:1s");
  expectRoundTrip(source);
});
