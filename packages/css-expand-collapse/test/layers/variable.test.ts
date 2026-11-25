import { expect, it } from "vitest";
import { parseCssLayers } from "../../src/index.js";

it("preserves unresolved variable layers", () => {
  const result = parseCssLayers("transition", "var(--motion), opacity 1s");
  expect(result.valid).toBeNull();
  expect(result.layers.map((layer) => layer.value)).toEqual(["var(--motion)", "opacity 1s"]);
  expect(result.declarations).toBeNull();
});
