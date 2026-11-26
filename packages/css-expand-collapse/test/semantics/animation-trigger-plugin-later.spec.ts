import { expect, it } from "vitest";
import { createCssTransformer } from "../../src/index.js";
import { animationTriggerPlugin } from "../../../css-experimental-shorthands/src/animation-trigger.js";
import { expectEquivalent } from "./helpers.js";

it("preserves a later explicit trigger with the draft plugin", ({ skip }) => {
  if (!CSS.supports("animation-trigger", "--reveal play")) {
    skip("Browser does not support animation triggers");
    return;
  }
  const source = ".target{animation:1s ease example;animation-trigger:--reveal play}";
  const css = createCssTransformer();
  css.addPlugin(animationTriggerPlugin, { override: true });
  const expanded = css.expandCss(source);
  expect(expanded).toContain("animation-duration:1s");
  expectEquivalent(source, expanded);
});
