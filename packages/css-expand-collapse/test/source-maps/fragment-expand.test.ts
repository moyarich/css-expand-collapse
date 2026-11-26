import { expect, it } from "vitest";
import { expandDeclarations, transformDeclarationsWithSourceMap } from "../../src/index.js";
import { originalAt } from "./decode.js";

it("maps expanded fragment declarations to fragment-relative positions", () => {
  const input = "color:red;\n  margin: 1px 2px";
  const result = transformDeclarationsWithSourceMap(input, {
    mode: "expand", filename: "inline.css", includeProvenance: true,
  });
  expect(result.css).toBe(expandDeclarations(input));
  expect(result.map.sources).toEqual(["inline.css"]);
  expect(result.map.sourcesContent).toEqual([input]);
  expect(originalAt(result.map.mappings, result.css.indexOf("margin-top"))).toEqual([1, 2]);
  const origin = result.provenance?.find((item) => item.property === "margin-top")?.sources[0];
  expect(origin?.location.start.offset).toBe(input.indexOf("margin"));
});
