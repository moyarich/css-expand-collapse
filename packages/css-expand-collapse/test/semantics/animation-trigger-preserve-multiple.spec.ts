import { expect, it } from "vitest";
import { expandCss } from "../../src/index.js";
import { expectRoundTrip } from "./helpers.js";

it("matches native animation-trigger behavior (multiple)", ({ skip }) => {
  if (!CSS.supports("animation-trigger", "--first play,--second play pause")) {
    skip("Browser does not support multiple animation triggers");
    return;
  }
  const source = ".target{animation-trigger:--first play,--second play pause;animation:1s first,2s second}";
  expect(expandCss(source)).toContain("animation-duration:");
  expectRoundTrip(source);
});
