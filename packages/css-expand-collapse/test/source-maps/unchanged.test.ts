import { expect, it } from "vitest";
import { transformCssWithSourceMap } from "../../src/index.js";
import { originalAt } from "./decode.js";

it("maps unchanged declarations to their authored position", () => {
  const input = ".card {\n  color: red;\n}";
  const { css, map } = transformCssWithSourceMap(input, { mode: "expand" });
  expect(originalAt(map.mappings, css.indexOf("color:"))).toEqual([1, 2]);
});
