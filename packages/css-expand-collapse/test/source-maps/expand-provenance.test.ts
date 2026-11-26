import { expect, it } from "vitest";
import { transformCssWithSourceMap } from "../../src/index.js";

it("records shared shorthand origin for expanded declarations", () => {
  const source = ".card { margin:1px 2px; color:red }";
  const result = transformCssWithSourceMap(source, { mode: "expand", includeProvenance: true });
  const items = result.provenance?.filter((item) => item.property.startsWith("margin-"));
  expect(items).toHaveLength(4);
  for (const item of items ?? []) {
    expect(item.sources.map((entry) => entry.property)).toEqual(["margin"]);
    const location = item.sources[0]!.location;
    expect(source.slice(location.start.offset, location.end.offset)).toBe("margin:1px 2px");
  }
});
