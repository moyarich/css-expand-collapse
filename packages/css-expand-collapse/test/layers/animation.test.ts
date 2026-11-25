import { expect, it } from "vitest";
import { parseCssLayers } from "../../src/index.js";

it("parses animation layers in authored order", () => {
  const result = parseCssLayers("animation", "fade 1s, slide 2s");
  expect(result.valid).toBe(true);
  expect(result.layers).toHaveLength(2);
  expect(result.declarations?.["animation-name"]).toBe("fade, slide");
});
