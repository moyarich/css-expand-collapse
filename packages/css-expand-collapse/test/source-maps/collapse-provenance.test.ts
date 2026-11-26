import { expect, it } from "vitest";
import { transformCssWithSourceMap } from "../../src/index.js";

it("records every consumed longhand for a generated shorthand", () => {
  const source = ".card { margin-top:1px; margin-right:2px; margin-bottom:1px; margin-left:2px; color:red }";
  const result = transformCssWithSourceMap(source, { mode: "collapse", includeProvenance: true });
  const margin = result.provenance?.find((item) => item.property === "margin");
  expect(margin?.sources.map((item) => item.property)).toEqual([
    "margin-top", "margin-right", "margin-bottom", "margin-left",
  ]);
  expect(margin?.sources.map(({ location }) => source.slice(location.start.offset, location.end.offset))).toEqual([
    "margin-top:1px", "margin-right:2px", "margin-bottom:1px", "margin-left:2px",
  ]);
});
