import { expect, it } from "vitest";
import { parseCssLayers } from "../../src/index.js";

it("parses mask layers in authored order", () => {
  const result = parseCssLayers("mask", "linear-gradient(black, transparent), none");
  expect(result.valid).toBe(true);
  expect(result.layers).toHaveLength(2);
  expect(result.declarations?.["mask-image"]).toBe("linear-gradient(black, transparent), none");
});
