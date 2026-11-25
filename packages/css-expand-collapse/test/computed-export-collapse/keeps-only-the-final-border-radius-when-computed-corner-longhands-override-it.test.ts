import { expect, it } from "vitest";
import { collapseCss } from "../../src/index.js";

it("keeps only the final border-radius when computed corner longhands override it", () => {
  const css = collapseCss(`
    .bubble {
      border-radius: 12px;
      border-top-left-radius: 0px;
      border-top-right-radius: 0px;
      border-bottom-right-radius: 0px;
      border-bottom-left-radius: 0px;
    }
  `);

  expect(css).toBe(".bubble{border-radius:0px}");
  expect(css.match(/border-radius:/g)).toHaveLength(1);
});
