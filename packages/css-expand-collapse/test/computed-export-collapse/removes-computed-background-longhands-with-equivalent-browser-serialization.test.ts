import { expect, it } from "vitest";
import { collapseCss } from "../../src/index.js";

it("removes computed background longhands with equivalent browser serialization", () => {
  const css = collapseCss(`
    .bubble {
      background: none;
      background-color: rgba(0, 0, 0, 0);
      background-image: none;
      background-position: 0% 0%;
      background-repeat: repeat;
      background-size: auto;
    }
  `);

  expect(css).toBe(".bubble{background:none}");
});
