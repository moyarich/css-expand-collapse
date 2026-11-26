import { expect, it } from "vitest";
import { createCssTransformer } from "@moyarich/css-expand-collapse";
import { animationTriggerPlugin } from "@moyarich/css-experimental-shorthands";

it("opts into the draft trigger reset for multiple animation layers", () => {
  const css = createCssTransformer();
  css.addPlugin(animationTriggerPlugin, { override: true });
  const result = css.expandShorthand("animation", "1s ease fade, 2s linear slide");
  expect(result?.declarations["animation-trigger"]).toBe("none");
  expect(result?.declarations["animation-name"]).toBe("fade, slide");
});
