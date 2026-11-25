import { expect, it } from "vitest";
import { splitCssLayers } from "../../src/index.js";

it("preserves nested commas and authored layer offsets", () => {
  const value = 'linear-gradient(red, blue), url("a,b.png")';
  const layers = splitCssLayers(value);
  expect(layers?.map((layer) => layer.value)).toEqual([
    "linear-gradient(red, blue)", 'url("a,b.png")',
  ]);
  expect(layers?.every((layer) => value.slice(layer.start, layer.end) === layer.value)).toBe(true);
});
