import { expect, it } from "vitest";
import { collapseCss } from "../../src/index.js";

it("replaces an earlier border-radius shorthand with the collapsed computed corner set", () => {
  const css = collapseCss(`
    .bubble {
      border-radius: 9999px;
      border-top-left-radius: 9999px;
      border-top-right-radius: 9999px;
      border-bottom-right-radius: 9999px;
      border-bottom-left-radius: 9999px;
    }
  `);

  expect(css).toBe(".bubble{border-radius:9999px}");
  expect(css.match(/border-radius:/g)).toHaveLength(1);
});
