import { expect, it } from "vitest";
import { collapseToShorthand, expandShorthand } from "../../src/index.js";

it("collapses a CSSTree-owned transition", () => {
  const collapsed = collapseToShorthand("transition", {
    "transition-property": "opacity",
    "transition-duration": "200ms",
    "transition-timing-function": "ease",
    "transition-delay": "50ms",
    "transition-behavior": "normal",
  });
  expect(collapsed?.property).toBe("transition");
  expect(collapsed?.value).toBeTruthy();
  expect(
    expandShorthand("transition", collapsed!.value)?.declarations,
  ).toEqual(collapsed!.declarations);
});
