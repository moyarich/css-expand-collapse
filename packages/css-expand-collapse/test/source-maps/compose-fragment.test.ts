import { expect, it } from "vitest";
import { transformDeclarationsWithSourceMap } from "../../src/index.js";
import { originalAt } from "./decode.js";

it("composes declaration fragment maps without wrapper offsets", () => {
  const source = "\n  margin:1px 2px";
  const first = transformDeclarationsWithSourceMap(source, { mode: "expand", filename: "original.css" });
  const second = transformDeclarationsWithSourceMap(first.css, {
    mode: "collapse", inputSourceMap: first.map, includeProvenance: true,
  });
  expect(second.css).toBe("margin:1px 2px");
  expect(second.map.sourcesContent).toEqual([source]);
  expect(originalAt(second.map.mappings, 0)).toEqual([1, 2]);
  expect(second.provenance?.[0]?.sources[0]?.location.start.offset).toBe(0);
});
