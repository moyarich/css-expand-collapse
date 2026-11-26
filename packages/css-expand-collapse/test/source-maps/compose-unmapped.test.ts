import { expect, it } from "vitest";
import { transformDeclarationsWithSourceMap } from "../../src/index.js";
import { originalAt } from "./decode.js";

it("does not invent an original position when the upstream map is unmapped", () => {
  const result = transformDeclarationsWithSourceMap("margin:1px", {
    mode: "expand",
    inputSourceMap: { version: 3, sources: ["original.css"], names: [], mappings: "A" },
  });
  expect(result.css).toContain("margin-top:");
  expect(originalAt(result.map.mappings, 0)).toBeUndefined();
});
