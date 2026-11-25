import { expect, it } from "vitest";
import { parseCssLayers } from "../../src/index.js";

it("expands layered background with default values", () => {
  const result = parseCssLayers("background", "linear-gradient(red, blue), white");
  expect(result.valid).toBe(true);
  expect(result.layers).toHaveLength(2);
  expect(result.declarations?.["background-color"]).toBe("white");
});
