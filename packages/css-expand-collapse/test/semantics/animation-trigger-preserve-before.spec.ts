import { expect, it } from "vitest";
import { expandCss } from "../../src/index.js";
import { expectRoundTrip } from "./helpers.js";

it("matches native animation-trigger behavior (before)", ({ skip }) => {
  if (!CSS.supports("animation-trigger", "--reveal play")) {
    skip("Browser does not support animation triggers");
    return;
  }
  const source = ".target{animation-trigger:--reveal play;animation:1s ease example}";
  expect(expandCss(source)).toContain("animation-duration:1s");
  expectRoundTrip(source);
});
