import { expect, it } from "vitest";
import { parseCssLayers } from "../../src/index.js";

it("parses transition layers in authored order", () => {
  const result = parseCssLayers("transition", "opacity 1s, color 2s");
  expect(result.valid).toBe(true);
  expect(result.layers).toHaveLength(2);
  expect(result.declarations?.["transition-property"]).toBe("opacity, color");
});
