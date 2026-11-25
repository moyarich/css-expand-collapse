import { expect, it } from "vitest";
import { expandShorthand } from "../../src/index.js";

it("expands a multi-layer background without CSSOM", () => {
  expect(
    expandShorthand("background", "url(a.png) center / cover no-repeat, red")
      ?.declarations,
  ).toEqual({
    "background-image": "url(a.png), none",
    "background-position": "center, 0% 0%",
    "background-size": "cover, auto auto",
    "background-repeat": "no-repeat, repeat",
    "background-origin": "padding-box, padding-box",
    "background-clip": "border-box, border-box",
    "background-attachment": "scroll, scroll",
    "background-color": "red",
  });
});
