import { expect, it } from "vitest";
import { transformCssWithSourceMap } from "../../src/index.js";
import { originalAt } from "./decode.js";

it("composes expansion and collapse back to the original stylesheet", () => {
  const source = ".card {\n  margin: 1px 2px;\n}";
  const first = transformCssWithSourceMap(source, {
    mode: "expand", filename: "original.css", outputFilename: "expanded.css",
  });
  const second = transformCssWithSourceMap(first.css, {
    mode: "collapse", inputSourceMap: first.map, outputFilename: "final.css",
  });
  expect(second.css).toContain("margin:1px 2px");
  expect(second.map).toMatchObject({ file: "final.css", sources: ["original.css"], sourcesContent: [source] });
  expect(originalAt(second.map.mappings, second.css.indexOf("margin:"))).toEqual([1, 2]);
});
