import { expect, it } from "vitest";
import { transformCssWithSourceMap } from "../../src/index.js";

it("leaves provenance absent by default and retains unchanged declarations when requested", () => {
  const source = ".card { color:red }";
  const plain = transformCssWithSourceMap(source, { mode: "expand" });
  const detailed = transformCssWithSourceMap(source, { mode: "expand", includeProvenance: true });
  expect(plain.provenance).toBeUndefined();
  expect(detailed.css).toBe(plain.css);
  expect(detailed.map).toEqual(plain.map);
  expect(detailed.provenance).toMatchObject([{ property: "color", declarationIndex: 0, sources: [{ property: "color" }] }]);
});
