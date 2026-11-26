import { expect, it } from "vitest";
import { transformDeclarationsWithSourceMap } from "../../src/index.js";

it("returns an empty mapped declaration fragment without a synthetic selector", () => {
  const result = transformDeclarationsWithSourceMap("", {
    mode: "expand", filename: "empty.css", includeProvenance: true,
  });
  expect(result.css).toBe("");
  expect(result.map.sources).toEqual(["empty.css"]);
  expect(result.map.sourcesContent).toEqual([""]);
  expect(result.provenance).toEqual([]);
});
