import { expect, test } from "vitest";
import { createCssTransformer, expandShorthands } from "../../src/index.js";

test("creates independent transformer functions with default shorthand behavior", () => {
  const first = createCssTransformer();
  const second = createCssTransformer();
  expect(first).not.toBe(second);
  expect(first.expand).not.toBe(second.expand);
  expect(first.expand({ margin: "1px" })).toEqual(expandShorthands({ margin: "1px" }));
  expect(second.collapse({ "margin-top": "1px", "margin-right": "1px", "margin-bottom": "1px", "margin-left": "1px" })).toEqual({ margin: "1px" });
});
