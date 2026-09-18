import { describe, expect, it } from "vitest";
import {
  collapseToShorthand,
  expandShorthand,
  supportsTransform,
} from "../src/index.js";

describe("CSSTree runtime-neutral shorthands", () => {
  it("expands a multi-layer background without CSSOM", () => {
    expect(expandShorthand(
      "background",
      "url(a.png) center / cover no-repeat, red",
    )?.declarations).toEqual({
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

  it("expands transition layers without a DOM", () => {
    expect(expandShorthand("transition", "opacity 200ms ease 50ms")?.declarations).toEqual({
      "transition-property": "opacity",
      "transition-duration": "200ms",
      "transition-timing-function": "ease",
      "transition-delay": "50ms",
      "transition-behavior": "normal",
    });
  });

  it("expands animation and resets animation-timeline", () => {
    expect(
      expandShorthand("animation", "fade 200ms ease 50ms 2 reverse both paused")?.declarations,
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

  it("expands explicit font shorthand without browser CSSOM", () => {
    expect(
      expandShorthand("font", 'italic 700 16px/1.5 "Open Sans", sans-serif')?.declarations,
    ).toEqual({
      "font-family": '"Open Sans", sans-serif',
      "font-size": "16px",
      "font-width": "normal",
      "font-style": "italic",
      "font-variant": "normal",
      "font-weight": "700",
      "line-height": "1.5",
    });
  });

  it("expands grid auto-flow without browser CSSOM", () => {
    expect(expandShorthand("grid", "auto-flow 100px / 1fr 1fr")?.declarations).toEqual({
      "grid-auto-columns": "auto",
      "grid-auto-flow": "row",
      "grid-auto-rows": "100px",
      "grid-template-areas": "none",
      "grid-template-columns": "1fr 1fr",
      "grid-template-rows": "none",
    });
  });

  it("supports elliptical border-radius without CSSOM fallback", () => {
    expect(expandShorthand("border-radius", "10px 20px / 30px 40px")?.declarations).toEqual({
      "border-top-left-radius": "10px 30px",
      "border-top-right-radius": "20px 40px",
      "border-bottom-right-radius": "10px 30px",
      "border-bottom-left-radius": "20px 40px",
    });
  });

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
    expect(expandShorthand("transition", collapsed!.value)?.declarations)
      .toEqual(collapsed!.declarations);
  });

  it("reports complex shorthands as supported transforms", () => {
    for (const property of [
      "background",
      "mask",
      "animation",
      "transition",
      "font",
      "grid",
      "list-style",
      "offset",
      "text-emphasis",
    ]) {
      expect(supportsTransform(property)).toBe(true);
    }
  });
});
