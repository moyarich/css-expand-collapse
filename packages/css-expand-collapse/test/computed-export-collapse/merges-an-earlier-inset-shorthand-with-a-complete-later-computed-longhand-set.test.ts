import { expect, it } from "vitest";
import { collapseCss } from "../../src/index.js";

it("merges an earlier inset shorthand with a complete later computed longhand set", () => {
  const css = collapseCss(`
    .tip {
      inset: 0px auto auto 50%;
      top: 0px;
      right: -27.5px;
      bottom: -19.8px;
      left: 0px;
    }
  `);

  expect(css).toContain("inset:0px -27.5px -19.8px 0px");
  expect(css).not.toMatch(/[;{]top:/);
  expect(css).not.toMatch(/[;{]right:/);
  expect(css).not.toMatch(/[;{]bottom:/);
  expect(css).not.toMatch(/[;{]left:/);
});
