import { expect, it } from "vitest";
import { expandCss } from "../../src/index.js";
import { expectEquivalent, expectRoundTrip } from "./helpers.js";

it("preserves triggers for multiple animation layers", ({ skip }) => {
  if (!CSS.supports("animation-trigger", "--first play,--second play pause")) {
    skip("Browser does not support multiple animation triggers");
    return;
  }
  const source = ".target{animation-trigger:--first play,--second play pause;animation:1s first,2s second}";
  const reference = ".target{animation:1s first,2s second;animation-trigger:--first play,--second play pause}";
  expectEquivalent(source, reference);
  expect(expandCss(source)).toContain("animation-duration:");
  expectRoundTrip(source);
});
