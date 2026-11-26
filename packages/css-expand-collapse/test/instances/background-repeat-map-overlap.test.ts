import { expect, it } from "vitest";
import { createCssTransformer } from "../../src/index.js";

it("preserves a declaration map mixing background and repeat axes", () => {
  const css = createCssTransformer();
  const declarations = { background: "none", "background-repeat-x": "repeat" };
  expect(css.expand(declarations)).toEqual(declarations);
  expect(css.collapse(declarations)).toEqual(declarations);
});
