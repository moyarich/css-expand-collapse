import { expect, it } from "vitest";
import { createCssTransformer } from "../../src/index.js";

it("restores a recognized-only shorthand when its plugin is removed", () => {
  const css = createCssTransformer();
  css.addPlugin({ name: "repeat", replaceRecognized: ["background-repeat"], shorthands: {
    "background-repeat": { longhands: new Map([["background-repeat-x", "repeat"]]), expand: (value) => ({ "background-repeat-x": value }) },
  } });
  expect(css.supportsExpand("background-repeat")).toBe(true);
  expect(css.removePlugin("repeat")).toBe(true);
  expect(css.isShorthand("background-repeat")).toBe(true);
  expect(css.supportsExpand("background-repeat")).toBe(false);
  expect(css.removePlugin("repeat")).toBe(false);
});
