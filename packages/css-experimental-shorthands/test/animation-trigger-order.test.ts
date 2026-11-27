import { expect, it } from "vitest";
import { createCssTransformer } from "@moyarich/css-expand-collapse";
import { animationTriggerPlugin } from "@moyarich/css-experimental-shorthands";

it("applies the explicit reset in declaration order", () => {
  const css = createCssTransformer();
  css.addPlugin(animationTriggerPlugin, { override: true });
  expect(css.expand({ "animation-trigger": "--reveal play", animation: "1s fade" })["animation-trigger"]).toBe("none");
  expect(css.expand({ animation: "1s fade", "animation-trigger": "--reveal play" })["animation-trigger"]).toBe("--reveal play");
});
