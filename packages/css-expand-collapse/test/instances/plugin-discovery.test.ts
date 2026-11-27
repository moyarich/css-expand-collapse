import { expect, it } from "vitest";
import { createCssTransformer } from "../../src/index.js";

it("exposes immutable instance-local plugin information in registration order", () => {
  const css = createCssTransformer({ plugins: [{ name: "base" }, { name: "extra", requires: ["base"] }] });
  expect(css.hasPlugin("extra")).toBe(true);
  expect(css.getPlugin("extra")?.requires).toEqual(["base"]);
  expect(Object.isFrozen(css.getPlugin("extra")?.requires)).toBe(true);
  expect(css.listPlugins().map((plugin) => plugin.name)).toEqual(["base", "extra"]);
  expect(createCssTransformer().listPlugins()).toEqual([]);
});
