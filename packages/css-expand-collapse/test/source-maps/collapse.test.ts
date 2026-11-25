import { expect, it } from "vitest";
import { collapseCss, transformCssWithSourceMap } from "../../src/index.js";
import { originalAt } from "./decode.js";

it("maps a collapsed shorthand to the first consumed declaration", () => {
  const input = ".card {\n  margin-top: 1px; margin-right: 2px; margin-bottom: 1px; margin-left: 2px;\n}";
  const { css, map } = transformCssWithSourceMap(input, { mode: "collapse" });
  expect(css).toBe(collapseCss(input));
  expect(css).toContain("margin:1px 2px");
  expect(originalAt(map.mappings, css.indexOf("margin:"))).toEqual([1, 2]);
});
