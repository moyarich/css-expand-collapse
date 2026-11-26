import { expect, it } from "vitest";
import { expandCss, transformCssWithSourceMap } from "../../src/index.js";
import { originalAt } from "./decode.js";

it("maps expanded longhands to the original shorthand declaration", () => {
  const input = ".card {\n  margin: 10px 20px;\n}";
  const { css, map } = transformCssWithSourceMap(input, {
    mode: "expand", filename: "styles.css", outputFilename: "expanded.css",
  });
  expect(css).toBe(expandCss(input));
  expect(map).toMatchObject({
    version: 3, file: "expanded.css", sources: ["styles.css"], sourcesContent: [input],
  });
  for (const property of ["margin-top", "margin-right", "margin-bottom", "margin-left"]) {
    expect(originalAt(map.mappings, css.indexOf(property))).toEqual([1, 2]);
  }
});
