import { expect, it } from "vitest";
import { createCssTransformer } from "../../src/index.js";
import { animationTriggerPlugin } from "../../../css-experimental-shorthands/src/animation-trigger.js";
import { computed, expectEquivalent } from "./helpers.js";

it("compares authored CSS, default transformation and explicit draft trigger reset", ({ skip }) => {
  if (!CSS.supports("animation-trigger", "--reveal play")) {
    skip("Browser does not support animation triggers");
    return;
  }
  const source = ".target{animation-trigger:--reveal play;animation:1s ease example}";
  const markup = '<div class="target">Example</div>';
  const defaultCss = createCssTransformer();
  const draftCss = createCssTransformer();
  draftCss.addPlugin(animationTriggerPlugin, { override: true });
  const expanded = draftCss.expandCss(source);
  const authored = computed(source, markup, [".target"])[0]!;
  const draft = computed(expanded, markup, [".target"])[0]!;
  const explicitReset = computed(source.replace("animation:1s ease example", "animation:1s ease example;animation-trigger:none"), markup, [".target"])[0]!;
  expectEquivalent(source, defaultCss.expandCss(source));
  expectEquivalent(source, defaultCss.collapseCss(defaultCss.expandCss(source)));
  expect(expanded).toContain("animation-trigger:none");
  expect(draft["animation-trigger"]).toBe(explicitReset["animation-trigger"]);
  expect(draft["animation-trigger"]).toBe("none");
  expect(authored["animation-trigger"]).not.toBeUndefined();
  console.info("Native animation-trigger reset comparison", {
    authored: authored["animation-trigger"], draft: draft["animation-trigger"], userAgent: navigator.userAgent,
  });
  draftCss.removePlugin(animationTriggerPlugin.name);
  expectEquivalent(source, draftCss.expandCss(source));
});
