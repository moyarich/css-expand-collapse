import { expect, it } from "vitest";
import { collapseDeclarations, transformDeclarationsWithSourceMap } from "../../src/index.js";
import { originalAt } from "./decode.js";

it("maps collapsed fragments and retains all authored longhand ranges", () => {
  const input = "margin-top:1px; margin-right:2px; margin-bottom:1px; margin-left:2px";
  const result = transformDeclarationsWithSourceMap(input, { mode: "collapse", includeProvenance: true });
  expect(result.css).toBe(collapseDeclarations(input));
  expect(result.css).toBe("margin:1px 2px");
  expect(originalAt(result.map.mappings, 0)).toEqual([0, 0]);
  expect(result.provenance?.[0]?.sources.map(({ location }) =>
    input.slice(location.start.offset, location.end.offset),
  )).toEqual(["margin-top:1px", "margin-right:2px", "margin-bottom:1px", "margin-left:2px"]);
});
