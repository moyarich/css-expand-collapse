import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";

it("expands animation and resets animation-timeline", () => {
  expect(
    expandShorthand("animation", "fade 200ms ease 50ms 2 reverse both paused")
      ?.declarations,
  ).toEqual({
    "animation-name": "fade",
    "animation-duration": "200ms",
    "animation-timing-function": "ease",
    "animation-delay": "50ms",
    "animation-iteration-count": "2",
    "animation-direction": "reverse",
    "animation-fill-mode": "both",
    "animation-play-state": "paused",
    "animation-timeline": "auto",
  });
});
